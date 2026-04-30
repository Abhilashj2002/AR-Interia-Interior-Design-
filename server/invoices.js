import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INVOICES_DIR = path.join(__dirname, '..', 'public', 'invoices');
const INVOICE_TIME_ZONE = 'Asia/Kolkata';

const parseInvoiceTimestamp = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value || '').trim();
  if (!raw) return null;
  // SQLite CURRENT_TIMESTAMP comes as UTC without timezone suffix.
  const sqliteUtcPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
  const normalized = sqliteUtcPattern.test(raw) ? `${raw.replace(' ', 'T')}Z` : raw;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatInvoiceDate = (value) => {
  const date = parseInvoiceTimestamp(value);
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INVOICE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatInvoiceTime = (value) => {
  const date = parseInvoiceTimestamp(value);
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INVOICE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
};

const formatPaymentMethodLabel = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return 'N/A';
  const lower = raw.toLowerCase();
  if (lower === 'razorpay') return 'Razorpay';
  if (lower === 'phonepe') return 'PhonePe';
  if (lower === 'card') return 'Card';
  if (lower === 'cash') return 'Cash';
  return raw.replace(/\b\w/g, (char) => char.toUpperCase());
};

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatINRCurrency = (value) => {
  const amount = Math.max(0, toNumber(value, 0));
  return `INR ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const truncateToWidth = (doc, text, maxWidth) => {
  const source = String(text || '');
  if (!source) return '';
  if (doc.widthOfString(source) <= maxWidth) return source;
  const ellipsis = '...';
  let end = source.length;
  while (end > 0) {
    const candidate = `${source.slice(0, end)}${ellipsis}`;
    if (doc.widthOfString(candidate) <= maxWidth) return candidate;
    end -= 1;
  }
  return ellipsis;
};

const normalizeLookupKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const extractBhkFromText = (value) => {
  const match = normalizeLookupKey(value).match(/(\d+)\s*bhk/);
  return match ? Number(match[1]) : null;
};

const extractPackageTypeFromText = (value) => {
  const normalized = normalizeLookupKey(value);
  if (normalized.includes('villa')) return 'villa';
  if (normalized.includes('apartment')) return 'apartment';
  return null;
};

const allAsyncSafe = (db, query, params = []) => new Promise((resolve, reject) => {
  db.all(query, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows || []);
  });
});

const INVOICE_LIST_COLUMNS = `
  id, customerId, paymentId, bookingId, invoiceNumber,
  amount, subtotal, tax, discount, status, items, pdfPath,
  customerName, customerEmail, customerPhone,
  packageName, designName, paymentMethod, paymentDateTime,
  createdAt, updatedAt
`;

const firstPositive = (...values) => {
  for (const value of values) {
    const numeric = toNumber(value, 0);
    if (numeric > 0) return numeric;
  }
  return 0;
};

export const resolvePackagePricing = async (db, candidates = []) => {
  if (!db) return null;

  const queryValues = candidates
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (!queryValues.length) return null;

  const packageRows = await allAsyncSafe(
    db,
    'SELECT id, name, subtitle, originalPrice, discountedPrice, bhk, type, category FROM packages',
    []
  );
  if (!packageRows.length) return null;

  const queryKey = normalizeLookupKey(queryValues.join(' '));
  const queryBhk = queryValues.map(extractBhkFromText).find((value) => Number.isFinite(value));
  const queryType = queryValues.map(extractPackageTypeFromText).find(Boolean);

  let bestMatch = null;
  let bestScore = -1;

  packageRows.forEach((pkg) => {
    const nameKey = normalizeLookupKey(pkg.name);
    const subtitleKey = normalizeLookupKey(pkg.subtitle);
    const combinedKey = normalizeLookupKey([pkg.name, pkg.subtitle, pkg.category, pkg.type].filter(Boolean).join(' '));

    let score = 0;
    if (nameKey && nameKey === queryKey) score += 120;
    if (subtitleKey && subtitleKey === queryKey) score += 110;
    if (combinedKey && combinedKey === queryKey) score += 100;
    if (nameKey && queryKey && (nameKey.includes(queryKey) || queryKey.includes(nameKey))) score += 60;
    if (subtitleKey && queryKey && (subtitleKey.includes(queryKey) || queryKey.includes(subtitleKey))) score += 50;
    if (combinedKey && queryKey && (combinedKey.includes(queryKey) || queryKey.includes(combinedKey))) score += 45;
    if (queryBhk && Number(pkg.bhk) === Number(queryBhk)) score += 35;
    if (queryType && String(pkg.type || '').toLowerCase() === queryType) score += 25;
    if (queryType && combinedKey.includes(queryType)) score += 10;
    if (queryBhk && (combinedKey.includes(`${queryBhk} bhk`) || combinedKey.includes(`${queryBhk}bhk`))) score += 12;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = pkg;
    }
  });

  const structuredCandidates = packageRows.filter((pkg) => {
    const matchesBhk = !Number.isFinite(queryBhk) || Number(pkg.bhk) === Number(queryBhk);
    const matchesType = !queryType || String(pkg.type || '').toLowerCase() === queryType;
    return matchesBhk && matchesType;
  });

  if ((!bestMatch || bestScore < 25) && structuredCandidates.length > 0) {
    const candidatePool = structuredCandidates.length > 1
      ? structuredCandidates.sort((left, right) => Number(right.discountedPrice || right.originalPrice || 0) - Number(left.discountedPrice || left.originalPrice || 0))
      : structuredCandidates;
    bestMatch = candidatePool[0] || bestMatch;
  }

  if (!bestMatch) return null;

  return {
    id: bestMatch.id || null,
    packageName: bestMatch.name || bestMatch.subtitle || queryValues[0] || 'Booked Package',
    designName: bestMatch.subtitle || bestMatch.name || queryValues[0] || 'Design Service',
    originalPrice: Math.max(0, toNumber(bestMatch.originalPrice, 0)),
    discountedPrice: Math.max(0, toNumber(bestMatch.discountedPrice, 0)),
    bhk: Number(bestMatch.bhk || 0) || null,
    type: bestMatch.type || null,
    category: bestMatch.category || null,
  };
};

const normalizeInvoiceTotals = ({ subtotalInput, taxInput, discountInput, amountInput, computedSubtotal }) => {
  const tax = Math.max(0, toNumber(taxInput, 0));
  let discount = Math.max(0, toNumber(discountInput, 0));
  let amountAfterDiscount = Math.max(0, toNumber(amountInput, 0));
  let subtotal = Math.max(0, toNumber(subtotalInput, computedSubtotal));

  if (subtotal <= 0) {
    subtotal = Math.max(computedSubtotal, amountAfterDiscount + discount - tax, amountAfterDiscount);
  }

  if (amountAfterDiscount <= 0) {
    amountAfterDiscount = Math.max(0, subtotal + tax - discount);
  }

  // Infer missing discount for legacy rows where subtotal > final amount.
  if (discount <= 0 && subtotal > amountAfterDiscount + tax) {
    discount = Math.max(0, subtotal + tax - amountAfterDiscount);
  }

  // Guard legacy outliers (for example paise/rupee mismatch in stored subtotal).
  if (discount <= 0 && amountAfterDiscount > 0 && subtotal > amountAfterDiscount * 3) {
    subtotal = amountAfterDiscount;
  }

  const minimumSubtotal = Math.max(0, amountAfterDiscount + discount - tax);
  if (subtotal < minimumSubtotal) {
    subtotal = minimumSubtotal;
  }

  return { subtotal, tax, discount, amountAfterDiscount };
};

const isNumericLike = (value) => {
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'string') return false;
  return value.trim() !== '' && Number.isFinite(Number(value));
};

const normalizeInvoiceItems = (invoiceData) => {
  const sourceItems = Array.isArray(invoiceData?.items) ? invoiceData.items : [];
  if (!sourceItems.length) {
    return [
      {
        description: invoiceData?.designName || invoiceData?.packageName || 'Design Package',
        quantity: 1,
        unitPrice: toNumber(invoiceData?.subtotal, toNumber(invoiceData?.amount, 0)),
      },
    ];
  }

  return sourceItems.map((item, index) => {
    let description = item?.description ?? item?.name ?? item?.title ?? '';
    let quantityRaw = item?.quantity ?? item?.qty ?? 1;
    const unitPriceRaw = item?.unitPrice ?? item?.price ?? item?.amount ?? 0;

    // Some legacy invoices have quantity/description swapped; correct them defensively.
    if (typeof quantityRaw === 'string' && !isNumericLike(quantityRaw) && isNumericLike(description)) {
      const temp = description;
      description = quantityRaw;
      quantityRaw = temp;
    }

    const normalizedDescription = String(description || '').trim() || `Item ${index + 1}`;
    const quantity = Math.max(1, Math.round(toNumber(quantityRaw, 1)));
    const unitPrice = Math.max(0, toNumber(unitPriceRaw, 0));

    return {
      description: normalizedDescription,
      quantity,
      unitPrice,
    };
  });
};

// Ensure invoices directory exists
if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

// Initialize Nodemailer transporter using explicit SMTP settings when provided.
const smtpHost = String(process.env.SMTP_HOST || process.env.EMAIL_HOST || '').trim();
const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false').trim().toLowerCase() === 'true';
const smtpUser = String(process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const smtpPassword = String(process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || '').trim();

const transporter = nodemailer.createTransport(
  smtpHost
    ? {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    }
    : {
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: smtpUser || 'your-email@gmail.com',
        pass: smtpPassword || 'your-app-password',
      },
    }
);

const isEmailEnabled = () => {
  const enabled = String(process.env.EMAIL_ENABLED || 'false').trim().toLowerCase() === 'true';
  if (!enabled) return false;
  return Boolean(String(process.env.EMAIL_USER || '').trim()) && Boolean(String(process.env.EMAIL_PASSWORD || '').trim());
};

const INVOICE_ADMIN_EMAIL = String(process.env.INVOICE_ADMIN_EMAIL || 'admin954809@gmail.com').trim().toLowerCase();

const collectInvoiceRecipients = (customerEmail) => {
  const recipients = new Set();
  const normalizedCustomer = String(customerEmail || '').trim().toLowerCase();
  if (normalizedCustomer) recipients.add(normalizedCustomer);
  if (INVOICE_ADMIN_EMAIL) recipients.add(INVOICE_ADMIN_EMAIL);
  return Array.from(recipients);
};

// Generate unique invoice number
export const generateInvoiceNumber = async (db) => {
  return new Promise((resolve, reject) => {
    const prefix = 'INV-' + new Date().getFullYear() + '-';
    
    db.get(
      `SELECT invoiceNumber FROM invoices WHERE invoiceNumber LIKE ? ORDER BY invoiceNumber DESC LIMIT 1`,
      [prefix + '%'],
      (err, row) => {
        if (err) reject(err);
        const lastNumber = String(row?.invoiceNumber || '');
        const lastSuffix = lastNumber.startsWith(prefix) ? Number(lastNumber.slice(prefix.length)) : 0;
        const nextSuffix = Number.isFinite(lastSuffix) ? lastSuffix + 1 : 1;
        const invoiceNumber = prefix + String(nextSuffix).padStart(5, '0');
        resolve(invoiceNumber);
      }
    );
  });
};

// Create PDF invoice
export const generateInvoicePDF = (invoiceData) => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`;
      const filepath = path.join(INVOICES_DIR, filename);
      const paymentTimestamp = invoiceData.paymentDateTime || invoiceData.paymentTimestamp || invoiceData.createdAt || new Date().toISOString();
      const paymentDate = formatInvoiceDate(paymentTimestamp);
      const paymentTime = formatInvoiceTime(paymentTimestamp);
      const bookedPackageName = invoiceData.packageName || invoiceData.designName || 'Booked Package';
      const canonicalDesignName = invoiceData.designName || invoiceData.packageName || 'Design Service';
      const paymentMethod = formatPaymentMethodLabel(invoiceData.paymentMethod);
      const rawItems = normalizeInvoiceItems(invoiceData);
      const computedSubtotal = rawItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const {
        subtotal,
        tax,
        discount,
        amountAfterDiscount,
      } = normalizeInvoiceTotals({
        subtotalInput: invoiceData.subtotal,
        taxInput: invoiceData.tax,
        discountInput: invoiceData.discount,
        amountInput: invoiceData.amount,
        computedSubtotal,
      });

      const items = rawItems.map((item) => ({ ...item }));
      if (items.length === 1) {
        const qty = Math.max(1, toNumber(items[0].quantity, 1));
        items[0].quantity = qty;
        items[0].unitPrice = subtotal / qty;
      }

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown(0.4);

      const headerDetails = [
        ['Customer Name', invoiceData.customerName || 'N/A'],
        ['Booked Package', bookedPackageName],
        ['Design Name', canonicalDesignName],
        ['Amount After Discount', `₹${amountAfterDiscount.toLocaleString('en-IN')}`],
      ];

      doc.fontSize(11).font('Helvetica-Bold');
      headerDetails.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, { align: 'center' });
      });

      doc.moveDown(0.35);
      doc.fontSize(10).font('Helvetica').text('AR Interior Design Studio', { align: 'center' });
      doc.fontSize(9).text('Your Dreams, Our Design', { align: 'center' });
      doc.moveDown(1);

      // Invoice details
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice Number:', 50, doc.y);
      doc.fontSize(10).font('Helvetica').text(invoiceData.invoiceNumber, 150, doc.y - 14);

      doc.fontSize(10).font('Helvetica-Bold').text('Invoice Date:', 50, doc.y + 5);
      doc.fontSize(10).font('Helvetica').text(formatInvoiceDate(invoiceData.createdAt), 150, doc.y - 14);

      doc.fontSize(10).font('Helvetica-Bold').text('Due Date:', 50, doc.y + 5);
      doc.fontSize(10).font('Helvetica').text(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), 150, doc.y - 14);

      doc.moveDown(1.5);

      // Bill To
      doc.fontSize(11).font('Helvetica-Bold').text('Bill To:', 50);
      doc.fontSize(10).font('Helvetica');
      doc.text(invoiceData.customerName || 'N/A', 50, doc.y);
      doc.text(invoiceData.customerEmail || 'N/A', 50, doc.y);
      doc.text(invoiceData.customerPhone || 'N/A', 50, doc.y);

      doc.moveDown(1.5);

      // Booking / payment details
      let detailsY = doc.y;
      const writeDetailLine = (label, value) => {
        doc.fontSize(10).font('Helvetica-Bold').text(`${label}:`, 50, detailsY);
        doc.fontSize(10).font('Helvetica').text(String(value || 'N/A'), 180, detailsY);
        detailsY += 16;
      };

      doc.fontSize(11).font('Helvetica-Bold').text('Booking & Payment Details:', 50, detailsY);
      detailsY += 18;
      writeDetailLine('Booked Package', bookedPackageName);
      writeDetailLine('Design Name', canonicalDesignName);
      writeDetailLine('Payment Method', paymentMethod);
      writeDetailLine('Payment Date', paymentDate);
      writeDetailLine('Payment Time', paymentTime);
      doc.y = detailsY + 8;

      // Items table header
      const tableTop = doc.y;
      const tableLeft = 50;
      const tableRight = 545;
      const colDesc = tableLeft;
      const colQty = 300;
      const colUnit = 355;
      const colAmount = 445;
      const rowHeight = 20;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.rect(tableLeft, tableTop, tableRight - tableLeft, rowHeight).stroke();
      doc.text('Description', colDesc + 6, tableTop + 5);
      doc.text('Qty', colQty + 6, tableTop + 5);
      doc.text('Unit Price', colUnit + 6, tableTop + 5);
      doc.text('Amount', colAmount + 6, tableTop + 5);

      // Items
      doc.fontSize(9).font('Helvetica');
      let yPos = tableTop + rowHeight + 5;

      items.forEach((item) => {
        const lineAmount = item.quantity * item.unitPrice;
        const descriptionWidth = colQty - colDesc - 12;
        const safeDescription = truncateToWidth(doc, item.description || '', descriptionWidth);
        doc.text(safeDescription, colDesc + 6, yPos, {
          width: descriptionWidth,
          lineBreak: false,
        });
        doc.text(String(item.quantity), colQty + 6, yPos, {
          width: colUnit - colQty - 12,
          align: 'right',
          lineBreak: false,
        });
        doc.text(formatINRCurrency(item.unitPrice), colUnit + 6, yPos, {
          width: colAmount - colUnit - 12,
          align: 'right',
          lineBreak: false,
        });
        doc.text(formatINRCurrency(lineAmount), colAmount + 6, yPos, {
          width: tableRight - colAmount - 12,
          align: 'right',
          lineBreak: false,
        });
        yPos += rowHeight;
      });

      doc.moveTo(tableLeft, yPos).lineTo(tableRight, yPos).stroke();
      yPos += 12;

      // Totals
      const totalsLeft = 315;
      const totalsValueLeft = 445;
      const totalsValueWidth = 100;
      const totalsLabelWidth = 120;
      const writeTotalLine = (label, value, options = {}) => {
        doc.fontSize(options.fontSize || 10).font(options.bold ? 'Helvetica-Bold' : 'Helvetica');
        const labelText = truncateToWidth(doc, `${label}:`, totalsLabelWidth);
        const labelHeight = doc.heightOfString(labelText, { width: totalsLabelWidth });
        doc.text(labelText, totalsLeft, yPos, {
          width: totalsLabelWidth,
          lineBreak: false,
        });
        doc.text(value, totalsValueLeft, yPos, {
          width: totalsValueWidth,
          align: 'right',
          lineBreak: false,
        });
        yPos += Math.max(18, labelHeight + 2);
      };
      doc.fontSize(10).font('Helvetica');
      writeTotalLine('Subtotal', formatINRCurrency(subtotal));

      if (tax > 0) {
        writeTotalLine('Tax (18%)', formatINRCurrency(tax));
      }

      writeTotalLine('Discount Applied', `-${formatINRCurrency(discount)}`);

      yPos += 6;
      doc.fontSize(11).font('Helvetica-Bold');
      doc.moveTo(totalsLeft, yPos - 6).lineTo(tableRight, yPos - 6).stroke();
      doc.text('Amount After Discount:', totalsLeft, yPos, {
        width: totalsLabelWidth,
        lineBreak: false,
      });
      doc.text(formatINRCurrency(amountAfterDiscount), totalsValueLeft, yPos, {
        width: totalsValueWidth,
        align: 'right',
        lineBreak: false,
      });

      // Footer
      yPos += 50;
      doc.fontSize(9).font('Helvetica').fillColor('#666');
      doc.text('Thank you for your business!', 50, yPos);
      doc.text('This is an automated invoice. For queries, contact support.', 50, yPos + 15);

      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

      doc.on('error', (error) => {
        reject(error);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Send invoice email
export const sendInvoiceEmail = async (invoiceData, pdfPath) => {
  try {
    const subtotal = toNumber(invoiceData.subtotal, toNumber(invoiceData.amount, 0));
    const discount = Math.max(0, toNumber(invoiceData.discount, 0));
    const amountAfterDiscount = Math.max(0, toNumber(invoiceData.amount, subtotal - discount));
    const recipients = collectInvoiceRecipients(invoiceData.customerEmail);
    if (recipients.length === 0) {
      console.log('[Invoice] No valid recipients found, skipping email send');
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@arinteria.com',
      to: recipients[0],
      bcc: recipients.length > 1 ? recipients.slice(1).join(', ') : undefined,
      subject: `Invoice ${invoiceData.invoiceNumber} - ${invoiceData.customerName || 'Customer'} - ${invoiceData.designName || invoiceData.packageName || 'Design'} | AR Interior Design Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Invoice #${invoiceData.invoiceNumber}</h2>
          <h3 style="color: #555; margin-top: 0;">${invoiceData.customerName || 'Customer'} • ${invoiceData.designName || invoiceData.packageName || 'Design'}</h3>
          
          <p>Dear ${invoiceData.customerName},</p>
          
          <p>Thank you for your purchase! Please find your invoice details below:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Customer Name:</strong> ${invoiceData.customerName || 'N/A'}</p>
            <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
            <p><strong>Discount Applied:</strong> -₹${discount.toFixed(2)}</p>
            <p><strong>Amount After Discount:</strong> ₹${amountAfterDiscount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${formatInvoiceDate(invoiceData.createdAt)}</p>
            <p><strong>Booked Package:</strong> ${invoiceData.packageName || invoiceData.designName}</p>
            <p><strong>Design Name:</strong> ${invoiceData.designName || invoiceData.packageName}</p>
            <p><strong>Payment Method:</strong> ${formatPaymentMethodLabel(invoiceData.paymentMethod)}</p>
            <p><strong>Payment Date:</strong> ${formatInvoiceDate(invoiceData.paymentDateTime || invoiceData.createdAt)}</p>
            <p><strong>Payment Time:</strong> ${formatInvoiceTime(invoiceData.paymentDateTime || invoiceData.createdAt)}</p>
          </div>
          
          <p>Your invoice PDF is attached to this email.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Best regards,<br>
            AR Interior Design Studio<br>
            Contact: support@arinteria.com
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
          path: pdfPath,
        },
      ],
    };

    // Only send if email is configured
    if (isEmailEnabled()) {
      await transporter.sendMail(mailOptions);
      console.log('[Invoice] Email sent to recipients:', recipients.join(', '));
    } else {
      console.log('[Invoice] Email not configured, skipping email for recipients:', recipients.join(', '));
    }
  } catch (error) {
    console.error('[Invoice] Email sending error:', error.message);
    // Don't throw - invoice was created successfully even if email fails
  }
};

// Create invoice record
export const createInvoice = async (db, invoiceData) => {
  return new Promise((resolve, reject) => {
    const paymentId = String(invoiceData.paymentId || '').trim();
    const bookingId = String(invoiceData.bookingId || '').trim();

    const insertNow = () => {
      const id = crypto.randomUUID();
      const invoiceNumber = invoiceData.invoiceNumber;
      const stmt = db.prepare(`
        INSERT INTO invoices (
          id, customerId, paymentId, bookingId, invoiceNumber, amount, subtotal, tax, discount, 
          status, items, pdfPath, pdfData, customerName, customerEmail, customerPhone, packageName, designName, paymentMethod, paymentDateTime, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        invoiceData.customerId,
        paymentId || null,
        bookingId || null,
        invoiceNumber,
        invoiceData.amount,
        invoiceData.subtotal || invoiceData.amount,
        invoiceData.tax || 0,
        invoiceData.discount || 0,
        'generated',
        JSON.stringify(invoiceData.items || []),
        invoiceData.pdfPath,
        invoiceData.pdfData || null,
        invoiceData.customerName,
        invoiceData.customerEmail,
        invoiceData.customerPhone,
        invoiceData.packageName || invoiceData.designName,
        invoiceData.designName,
        invoiceData.paymentMethod || 'N/A',
        invoiceData.paymentDateTime || invoiceData.createdAt || new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        function (err) {
          if (err) reject(err);
          else resolve({ id, invoiceNumber });
        }
      );
      stmt.finalize();
    };

    if (paymentId) {
      db.get('SELECT id, invoiceNumber FROM invoices WHERE paymentId = ? LIMIT 1', [paymentId], (err, row) => {
        if (err) return reject(err);
        if (row) return resolve({ id: row.id, invoiceNumber: row.invoiceNumber, reused: true });

        if (bookingId) {
          db.get('SELECT id, invoiceNumber FROM invoices WHERE bookingId = ? LIMIT 1', [bookingId], (err2, row2) => {
            if (err2) return reject(err2);
            if (row2) return resolve({ id: row2.id, invoiceNumber: row2.invoiceNumber, reused: true });
            insertNow();
          });
          return;
        }

        insertNow();
      });
      return;
    }

    if (bookingId) {
      db.get('SELECT id, invoiceNumber FROM invoices WHERE bookingId = ? LIMIT 1', [bookingId], (err, row) => {
        if (err) return reject(err);
        if (row) return resolve({ id: row.id, invoiceNumber: row.invoiceNumber, reused: true });
        insertNow();
      });
      return;
    }

    insertNow();
  });
};

// Get invoice by ID
export const getInvoice = async (db, invoiceId) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ${INVOICE_LIST_COLUMNS}, pdfData FROM invoices WHERE id = ?`, [invoiceId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Get invoices for customer
export const getCustomerInvoices = async (db, customerId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT ${INVOICE_LIST_COLUMNS} FROM invoices WHERE customerId = ? ORDER BY createdAt DESC`,
      [customerId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
};

// Get all invoices (admin)
export const getAllInvoices = async (db) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT ${INVOICE_LIST_COLUMNS} FROM invoices ORDER BY createdAt DESC LIMIT 100`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
};

// Update invoice status
export const updateInvoiceStatus = async (db, invoiceId, status) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE invoices SET status = ?, updatedAt = ? WHERE id = ?`,
      [status, new Date().toISOString(), invoiceId],
      function (err) {
        if (err) reject(err);
        else resolve({ id: invoiceId, status });
      }
    );
  });
};

// Generate complete invoice with PDF
export const generateCompleteInvoice = async (db, paymentData, customerData) => {
  try {
    const packagePricing = await resolvePackagePricing(db, [
      paymentData.packageName,
      paymentData.designName,
      paymentData.packageTitle,
      paymentData.designTitle,
      customerData?.name,
    ]);

    const invoiceNumber = await generateInvoiceNumber(db);
    const paymentTimestamp = paymentData.paymentDateTime || paymentData.updatedAt || paymentData.createdAt || new Date().toISOString();
    let originalPrice = firstPositive(
      paymentData.originalPrice,
      paymentData.bookingPrice,
      paymentData.subtotal,
      paymentData.price,
      paymentData.amount,
      packagePricing?.originalPrice
    );
    let amountAfterDiscount = firstPositive(
      paymentData.discountedPrice,
      paymentData.cost,
      paymentData.bookingCost,
      paymentData.amount,
      paymentData.subtotal,
      packagePricing?.discountedPrice
    );

    const packageHasDiscount =
      toNumber(packagePricing?.originalPrice, 0) > 0 &&
      toNumber(packagePricing?.discountedPrice, 0) > 0 &&
      toNumber(packagePricing?.originalPrice, 0) > toNumber(packagePricing?.discountedPrice, 0);
    const bookingLooksUndiscounted =
      toNumber(paymentData.bookingPrice, 0) > 0 &&
      toNumber(paymentData.bookingPrice, 0) === toNumber(paymentData.bookingCost, 0);

    if (packageHasDiscount && bookingLooksUndiscounted) {
      originalPrice = toNumber(packagePricing.originalPrice, originalPrice);
      amountAfterDiscount = toNumber(packagePricing.discountedPrice, amountAfterDiscount);
    }
    let subtotal = Math.max(originalPrice, amountAfterDiscount);
    let finalAmount = amountAfterDiscount > 0 ? Math.min(subtotal, amountAfterDiscount) : subtotal;

    if (packageHasDiscount && (finalAmount >= subtotal || Math.abs(subtotal - finalAmount) < 0.01)) {
      subtotal = Math.max(subtotal, toNumber(packagePricing.originalPrice, subtotal));
      finalAmount = Math.min(subtotal, toNumber(packagePricing.discountedPrice, finalAmount));
    }

    const discount = Math.max(0, subtotal - finalAmount);
    const normalizedSubtotal = subtotal;
    const bookedPackageName = paymentData.packageName || packagePricing?.packageName || paymentData.designName || 'Booked Package';
    const canonicalDesignName = paymentData.designName || packagePricing?.designName || paymentData.packageName || 'Design Service';

    const invoiceData = {
      invoiceNumber,
      customerId: paymentData.customerId,
      paymentId: paymentData.id,
      bookingId: paymentData.bookingId,
      amount: finalAmount,
      subtotal: normalizedSubtotal,
      tax: 0,
      discount,
      customerName: customerData.name,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      packageName: bookedPackageName,
      designName: canonicalDesignName,
      paymentMethod: paymentData.paymentMethod || paymentData.method || 'N/A',
      paymentDateTime: paymentTimestamp,
      items: [
        {
          description: bookedPackageName || canonicalDesignName || 'Design Service',
          quantity: 1,
          unitPrice: normalizedSubtotal,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const pdfPath = await generateInvoicePDF(invoiceData);
    invoiceData.pdfPath = pdfPath;
    try {
      invoiceData.pdfData = fs.readFileSync(pdfPath);
    } catch (readError) {
      console.warn('[Invoice] Failed to read generated PDF for DB storage:', readError?.message || readError);
      invoiceData.pdfData = null;
    }

    const invoiceRecord = await createInvoice(db, invoiceData);
    await sendInvoiceEmail(invoiceData, pdfPath);

    return {
      success: true,
      invoice: invoiceRecord,
      pdfPath: `/invoices/${path.basename(pdfPath)}`,
    };
  } catch (error) {
    console.error('[Invoice] Generation error:', error);
    throw error;
  }
};

const getAsyncSafe = (db, query, params = []) => new Promise((resolve, reject) => {
  db.get(query, params, (err, row) => {
    if (err) return reject(err);
    resolve(row || null);
  });
});

// Idempotent: ensures one invoice per paymentId.
export const ensureInvoiceForPaymentId = async (db, paymentId) => {
  const safePaymentId = String(paymentId || '').trim();
  if (!safePaymentId) {
    return { success: false, skipped: true, reason: 'missing_payment_id' };
  }

  const existing = await getAsyncSafe(
    db,
    'SELECT id, invoiceNumber, paymentId FROM invoices WHERE paymentId = ? LIMIT 1',
    [safePaymentId]
  );
  if (existing) {
    return {
      success: true,
      skipped: true,
      reason: 'already_exists',
      invoice: existing
    };
  }

  const payment = await getAsyncSafe(
    db,
    `SELECT
       p.id,
       p.status,
       p.customerId,
       p.bookingId,
       p.designId,
       p.amount,
       p.method as paymentMethod,
       COALESCE(p.paymentDateTime, p.updatedAt, p.createdAt) as paymentDateTime,
       COALESCE(b.cost, 0) as bookingCost,
       COALESCE(b.price, 0) as bookingPrice,
       COALESCE(b.designName, d.title, 'Booked Package') as packageName,
       COALESCE(d.title, b.designName, 'Design Service') as designName
     FROM payments p
     LEFT JOIN bookings b ON b.id = p.bookingId
     LEFT JOIN designs d ON d.id = COALESCE(p.designId, b.designId)
     WHERE p.id = ?`,
    [safePaymentId]
  );
  if (!payment) {
    return { success: false, skipped: true, reason: 'payment_not_found' };
  }

  if (payment.bookingId) {
    const existingForBooking = await getAsyncSafe(
      db,
      'SELECT id, invoiceNumber, paymentId, bookingId FROM invoices WHERE bookingId = ? LIMIT 1',
      [payment.bookingId]
    );
    if (existingForBooking) {
      return {
        success: true,
        skipped: true,
        reason: 'booking_already_invoiced',
        invoice: existingForBooking
      };
    }
  }

  const normalizedStatus = String(payment.status || '').toLowerCase();
  if (!['completed', 'paid', 'success'].includes(normalizedStatus)) {
    return { success: false, skipped: true, reason: 'payment_not_completed' };
  }

  const customer = await getAsyncSafe(
    db,
    'SELECT id, name, email, phone FROM customers WHERE id = ? LIMIT 1',
    [payment.customerId]
  );
  if (!customer) {
    return { success: false, skipped: true, reason: 'customer_not_found' };
  }

  const packagePricing = await resolvePackagePricing(db, [payment.packageName, payment.designName]);
  const amount = Math.max(0, toNumber(payment.amount, 0));
  let bookingCost = firstPositive(payment.bookingCost, payment.amount, packagePricing?.discountedPrice);
  let bookingPrice = firstPositive(payment.bookingPrice, payment.amount, packagePricing?.originalPrice);
  const packageHasDiscount =
    toNumber(packagePricing?.originalPrice, 0) > 0 &&
    toNumber(packagePricing?.discountedPrice, 0) > 0 &&
    toNumber(packagePricing?.originalPrice, 0) > toNumber(packagePricing?.discountedPrice, 0);
  const bookingLooksUndiscounted =
    toNumber(payment.bookingPrice, 0) > 0 &&
    toNumber(payment.bookingPrice, 0) === toNumber(payment.bookingCost, 0);
  if (packageHasDiscount && bookingLooksUndiscounted) {
    bookingPrice = toNumber(packagePricing.originalPrice, bookingPrice);
    bookingCost = toNumber(packagePricing.discountedPrice, bookingCost);
  }
  const subtotal = bookingPrice > 0 ? bookingPrice : Math.max(bookingCost, amount);
  const amountAfterDiscount = bookingCost > 0 ? Math.min(subtotal, bookingCost) : (amount > 0 ? Math.min(subtotal, amount) : subtotal);
  const discount = Math.max(0, subtotal - amountAfterDiscount);

  const enrichedPayment = {
    ...payment,
    amount,
    subtotal,
    amountAfterDiscount,
    discount,
    price: subtotal,
    cost: amountAfterDiscount,
    originalPrice: subtotal,
    discountedPrice: amountAfterDiscount,
  };

  const generated = await generateCompleteInvoice(db, enrichedPayment, customer);
  return {
    success: true,
    skipped: false,
    reason: 'generated',
    ...generated
  };
};

// Get invoice download URL
export const getInvoiceDownloadUrl = (invoiceNumber) => {
  return `/api/invoices/download/${invoiceNumber}`;
};

export const regenerateAllInvoicePDFs = async (db) => {
  const getAllRows = () =>
    new Promise((resolve, reject) => {
      db.all('SELECT * FROM invoices ORDER BY createdAt DESC', (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });

  const getLinkedInvoiceContext = (invoiceRow) =>
    new Promise((resolve, reject) => {
      db.get(
        `SELECT
           i.id as invoiceId,
           i.invoiceNumber,
           i.customerId,
           i.paymentId,
           i.bookingId,
           p.amount as paymentAmount,
           p.method as paymentMethod,
            COALESCE(p.paymentDateTime, i.paymentDateTime, p.updatedAt, p.createdAt) as paymentDateTime,
           COALESCE(b.price, pkg.originalPrice, i.subtotal, i.amount) as bookingPrice,
           COALESCE(b.cost, pkg.discountedPrice, i.amount, i.subtotal) as bookingCost,
           COALESCE(b.designName, pkg.name, pkg.subtitle, d.title, i.packageName, i.designName) as packageName,
           COALESCE(d.title, pkg.name, pkg.subtitle, b.designName, i.designName, i.packageName) as designName,
           i.packageName as invoicePackageName,
           i.designName as invoiceDesignName,
           b.designName as bookingPackageName,
           d.title as designTitle,
           COALESCE(c.name, i.customerName) as customerName,
           COALESCE(c.email, i.customerEmail) as customerEmail,
           COALESCE(c.phone, i.customerPhone) as customerPhone
         FROM invoices i
         LEFT JOIN payments p ON p.id = i.paymentId
         LEFT JOIN bookings b ON b.id = i.bookingId
         LEFT JOIN designs d ON d.id = COALESCE(p.designId, b.designId)
         LEFT JOIN packages pkg ON pkg.id = COALESCE(b.designId, p.designId)
           OR LOWER(COALESCE(pkg.name, '')) = LOWER(COALESCE(i.packageName, i.designName, b.designName, d.title, ''))
           OR LOWER(COALESCE(pkg.subtitle, '')) = LOWER(COALESCE(i.packageName, i.designName, b.designName, d.title, ''))
         LEFT JOIN customers c ON c.id = i.customerId
         WHERE i.id = ?`,
        [invoiceRow.id],
        async (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);

          try {
            const packagePricing = await resolvePackagePricing(db, [
              row.invoicePackageName,
              row.invoiceDesignName,
              row.bookingPackageName,
              row.designTitle,
            ]);

            resolve({
              ...row,
              packageOriginalPrice: packagePricing?.originalPrice || null,
              packageDiscountedPrice: packagePricing?.discountedPrice || null,
              packageName: packagePricing?.packageName || row.bookingPackageName || row.designTitle || row.invoicePackageName || 'Booked Package',
              designName: packagePricing?.designName || row.designTitle || row.bookingPackageName || row.invoiceDesignName || 'Design Service',
            });
          } catch (lookupError) {
            reject(lookupError);
          }
        }
      );
    });

  const updateInvoiceRow = (invoiceId, patch) =>
    new Promise((resolve, reject) => {
      const entries = Object.entries(patch || {}).filter(([, value]) => value !== undefined);
      if (!entries.length) return resolve();
      const setClause = entries.map(([field]) => `${field} = ?`).join(', ');
      const values = entries.map(([, value]) => value);
      values.push(new Date().toISOString(), invoiceId);
      db.run(
        `UPDATE invoices SET ${setClause}, updatedAt = ? WHERE id = ?`,
        values,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

  const updatePdfPath = (invoiceId, pdfPath, pdfData) =>
    new Promise((resolve, reject) => {
      db.run(
        'UPDATE invoices SET pdfPath = ?, pdfData = ?, updatedAt = ? WHERE id = ?',
        [pdfPath, pdfData || null, new Date().toISOString(), invoiceId],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

  const rows = await getAllRows();
  const summary = {
    total: rows.length,
    regenerated: 0,
    failed: 0,
    failures: []
  };

  for (const row of rows) {
    try {
      const linkedContext = await getLinkedInvoiceContext(row);
      let parsedItems = [];
      if (row?.items) {
        try {
          parsedItems = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
        } catch {
          parsedItems = [];
        }
      }

      const resolvedSubtotal = Math.max(
        0,
        firstPositive(
          linkedContext?.packageOriginalPrice,
          linkedContext?.bookingPrice,
          row.subtotal,
          row.amount
        )
      );
      const resolvedAmount = Math.max(
        0,
        firstPositive(
          linkedContext?.packageDiscountedPrice,
          linkedContext?.bookingCost,
          linkedContext?.paymentAmount,
          row.amount
        )
      );
      const resolvedDiscount = Math.max(0, resolvedSubtotal - resolvedAmount);
      const resolvedCustomerName = linkedContext?.customerName || row.customerName;
      const resolvedCustomerEmail = linkedContext?.customerEmail || row.customerEmail;
      const resolvedCustomerPhone = linkedContext?.customerPhone || row.customerPhone;
      const resolvedPackageName = linkedContext?.packageName || row.packageName;
      const resolvedDesignName = linkedContext?.designName || row.designName;
      const resolvedPaymentMethod = linkedContext?.paymentMethod || row.paymentMethod;
      const resolvedPaymentDateTime = linkedContext?.paymentDateTime || row.paymentDateTime;

      await updateInvoiceRow(row.id, {
        amount: resolvedAmount,
        subtotal: resolvedSubtotal,
        discount: resolvedDiscount,
        customerName: resolvedCustomerName,
        customerEmail: resolvedCustomerEmail,
        customerPhone: resolvedCustomerPhone,
        packageName: resolvedPackageName,
        designName: resolvedDesignName,
        paymentMethod: resolvedPaymentMethod,
        paymentDateTime: resolvedPaymentDateTime,
      });

      const invoiceData = {
        invoiceNumber: row.invoiceNumber,
        customerId: row.customerId,
        paymentId: row.paymentId,
        bookingId: row.bookingId,
        amount: resolvedAmount,
        subtotal: resolvedSubtotal,
        tax: row.tax,
        discount: resolvedDiscount,
        customerName: resolvedCustomerName,
        customerEmail: resolvedCustomerEmail,
        customerPhone: resolvedCustomerPhone,
        packageName: resolvedPackageName,
        designName: resolvedDesignName,
        paymentMethod: resolvedPaymentMethod,
        paymentDateTime: resolvedPaymentDateTime,
        items: Array.isArray(parsedItems) ? parsedItems : [],
        createdAt: row.createdAt || new Date().toISOString()
      };

      const nextPdfPath = await generateInvoicePDF(invoiceData);
      let nextPdfData = null;
      try {
        nextPdfData = fs.readFileSync(nextPdfPath);
      } catch (readError) {
        console.warn('[Invoice] Failed to read regenerated PDF for DB storage:', readError?.message || readError);
      }
      await updatePdfPath(row.id, nextPdfPath, nextPdfData);
      summary.regenerated += 1;
    } catch (error) {
      summary.failed += 1;
      summary.failures.push({
        id: row?.id,
        invoiceNumber: row?.invoiceNumber,
        message: error?.message || String(error)
      });
    }
  }

  return summary;
};
