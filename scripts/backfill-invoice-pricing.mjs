import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDb, getDb } from '../server/db.js';
import { resolvePackagePricing, generateInvoicePDF } from '../server/invoices.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) return reject(err);
    resolve(rows || []);
  });
});

const runAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) return reject(err);
    resolve(this);
  });
});

const toNumber = (value, fallback = 0) => {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const firstPositive = (...values) => {
  for (const value of values) {
    const numeric = toNumber(value, 0);
    if (numeric > 0) return numeric;
  }
  return 0;
};

const main = async () => {
  await initializeDb();
  const db = getDb();
  if (!db) throw new Error('Database not initialized');

  const rows = await allAsync(
    db,
    `SELECT
       i.id as invoiceId,
       i.invoiceNumber,
       i.customerId,
       i.paymentId,
       i.bookingId,
       i.amount as invoiceAmount,
       i.subtotal as invoiceSubtotal,
       i.discount as invoiceDiscount,
       i.packageName as invoicePackageName,
       i.designName as invoiceDesignName,
       i.paymentMethod as invoicePaymentMethod,
       i.paymentDateTime as invoicePaymentDateTime,
       i.createdAt as invoiceCreatedAt,
       COALESCE(c.name, i.customerName) as customerName,
       COALESCE(c.email, i.customerEmail) as customerEmail,
       COALESCE(c.phone, i.customerPhone) as customerPhone,
       b.designName as bookingPackageName,
       b.price as bookingPrice,
       b.cost as bookingCost,
       d.title as designTitle,
       p.amount as paymentAmount,
       p.method as paymentMethod,
       COALESCE(p.updatedAt, p.createdAt, i.paymentDateTime) as paymentDateTime
     FROM invoices i
     LEFT JOIN customers c ON c.id = i.customerId
     LEFT JOIN bookings b ON b.id = i.bookingId
     LEFT JOIN payments p ON p.id = i.paymentId
     LEFT JOIN designs d ON d.id = COALESCE(p.designId, b.designId)
     ORDER BY i.createdAt ASC`
  );

  let updated = 0;
  let skipped = 0;
  const failures = [];

  for (const row of rows) {
    try {
      const packagePricing = await resolvePackagePricing(db, [
        row.invoicePackageName,
        row.invoiceDesignName,
        row.bookingPackageName,
        row.designTitle,
        row.customerName,
      ]);

      const originalPrice = firstPositive(
        packagePricing?.originalPrice,
        row.bookingPrice,
        row.invoiceSubtotal,
        row.invoiceAmount,
      );
      const finalAmount = firstPositive(
        packagePricing?.discountedPrice,
        row.bookingCost,
        row.paymentAmount,
        row.invoiceAmount,
      );
      const subtotal = originalPrice > 0 ? originalPrice : finalAmount;
      const amount = finalAmount > 0 ? Math.min(subtotal, finalAmount) : subtotal;
      const discount = Math.max(0, subtotal - amount);
      const packageName = packagePricing?.packageName || row.bookingPackageName || row.designTitle || row.invoicePackageName || row.invoiceDesignName || 'Booked Package';
      const designName = packagePricing?.designName || row.designTitle || row.bookingPackageName || row.invoiceDesignName || 'Design Service';
      const paymentMethod = String(row.invoicePaymentMethod || row.paymentMethod || 'N/A');
      const paymentDateTime = String(row.invoicePaymentDateTime || row.paymentDateTime || row.invoiceCreatedAt || new Date().toISOString());

      const changed =
        Number(row.invoiceSubtotal || 0) !== Number(subtotal || 0)
        || Number(row.invoiceAmount || 0) !== Number(amount || 0)
        || Number(row.invoiceDiscount || 0) !== Number(discount || 0)
        || String(row.invoicePackageName || '') !== String(packageName || '')
        || String(row.invoiceDesignName || '') !== String(designName || '');

      if (!changed) {
        skipped += 1;
        continue;
      }

      await runAsync(
        db,
        `UPDATE invoices
         SET subtotal = ?, amount = ?, discount = ?,
             packageName = ?, designName = ?,
             paymentMethod = CASE WHEN paymentMethod IS NULL OR TRIM(paymentMethod) = '' THEN ? ELSE paymentMethod END,
             paymentDateTime = CASE WHEN paymentDateTime IS NULL OR TRIM(paymentDateTime) = '' THEN ? ELSE paymentDateTime END,
             updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [subtotal, amount, discount, packageName, designName, paymentMethod, paymentDateTime, row.invoiceId]
      );

      const pdfPath = await generateInvoicePDF({
        invoiceNumber: row.invoiceNumber,
        customerId: row.customerId,
        paymentId: row.paymentId,
        bookingId: row.bookingId,
        amount,
        subtotal,
        tax: 0,
        discount,
        customerName: row.customerName,
        customerEmail: row.customerEmail,
        customerPhone: row.customerPhone,
        packageName,
        designName,
        paymentMethod,
        paymentDateTime,
        items: [
          {
            description: packageName || designName || 'Design Service',
            quantity: 1,
            unitPrice: subtotal,
          },
        ],
        createdAt: row.invoiceCreatedAt || new Date().toISOString(),
      });

      await runAsync(db, 'UPDATE invoices SET pdfPath = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [pdfPath, row.invoiceId]);
      updated += 1;
    } catch (error) {
      failures.push({
        id: row.invoiceId,
        invoiceNumber: row.invoiceNumber,
        message: error?.message || String(error),
      });
    }
  }

  console.log(JSON.stringify({ total: rows.length, updated, skipped, failed: failures.length, failures }, null, 2));
  process.exit(failures.length > 0 ? 1 : 0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
