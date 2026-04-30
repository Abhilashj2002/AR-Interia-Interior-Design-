import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { generateInvoicePDF, generateInvoiceNumber } from './invoices.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'ar_interia.db');

const db = new sqlite3.Database(DB_PATH, async (err) => {
  if (err) {
    console.error('Database error:', err);
    process.exit(1);
  }

  console.log('[Seed] Connected to database');

  try {
    // Get all customers
    const customers = await new Promise((resolve, reject) => {
      db.all("SELECT id, name, email, phone, username FROM customers WHERE LOWER(COALESCE(role, 'customer')) = 'customer' LIMIT 10", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    const bookings = await new Promise((resolve, reject) => {
      db.all(
        `SELECT
           b.id,
           b.customerId,
           b.designId,
           b.designName,
           b.cost,
           b.bookingDate,
           d.title AS designTitle,
           d.description AS designDescription,
           d.price AS designPrice
         FROM bookings b
         LEFT JOIN designs d ON d.id = b.designId
         ORDER BY b.bookingDate DESC
         LIMIT 50`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    const designs = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, title, description, price, categoryId FROM designs ORDER BY createdAt DESC LIMIT 50`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    if (customers.length === 0) {
      console.log('[Seed] No customers found. Creating sample customers first...');

      // Create sample customers
      const sampleCustomers = [
        {
          id: crypto.randomUUID(),
          name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          username: 'rajesh',
          phone: '9876543210',
        },
        {
          id: crypto.randomUUID(),
          name: 'Priya Sharma',
          email: 'priya@example.com',
          username: 'priya',
          phone: '9876543211',
        },
        {
          id: crypto.randomUUID(),
          name: 'Amit Patel',
          email: 'amit@example.com',
          username: 'amit',
          phone: '9876543212',
        },
      ];

      for (const customer of sampleCustomers) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO customers (id, name, email, username, phone, role, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customer.id, customer.name, customer.email, customer.username, customer.phone, 'customer', 'hashed_password'],
            (err) => {
              if (err && !err.message.includes('UNIQUE constraint failed')) {
                console.warn('Customer insert warning:', err.message);
              }
              resolve();
            }
          );
        });
      }

      customers.push(...sampleCustomers);
    }

    console.log(`[Seed] Found ${customers.length} customers`);

    // Create sample invoices using existing customers + bookings + designs
    const invoiceCount = Math.min(10, customers.length || 0);
    let created = 0;

    for (let i = 0; i < Math.min(invoiceCount, customers.length); i++) {
      const customer = customers[i];
      const matchingBooking = bookings.find((row) => String(row.customerId) === String(customer.id)) || bookings[i % Math.max(bookings.length, 1)] || null;
      const matchingDesign = designs.find((row) => String(row.id) === String(matchingBooking?.designId)) || designs[i % Math.max(designs.length, 1)] || null;
      const designName = matchingBooking?.designName || matchingBooking?.designTitle || matchingDesign?.title || `Sample Design ${i + 1}`;
      const packageName = matchingBooking?.designName || matchingBooking?.designTitle || matchingDesign?.title || `Sample Package ${i + 1}`;
      const amount = Number(matchingBooking?.cost || matchingDesign?.price || Math.floor(Math.random() * 50000) + 20000);
      const subtotal = Math.floor(amount * 0.85); // 15% tax
      const tax = amount - subtotal;
      const invoiceId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const paymentMethod = ['card', 'razorpay', 'phonepe', 'cash'][i % 4];
      const paymentDateTime = new Date().toISOString();

      // Generate PDF
      const invoiceData = {
        invoiceNumber: await generateInvoiceNumber(db),
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        packageName,
        designName,
        paymentMethod,
        paymentDateTime,
        amount,
        subtotal,
        tax,
        discount: 0,
        items: [
          {
            description: `Design Service - ${designName}`,
            quantity: 1,
            unitPrice: subtotal,
          },
        ],
        createdAt,
      };

      try {
        const pdfPath = await generateInvoicePDF(invoiceData);

        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO invoices (
                id, customerId, paymentId, bookingId, invoiceNumber, amount, subtotal, tax, discount,
                status, items, pdfPath, customerName, customerEmail, customerPhone, packageName, designName, paymentMethod, paymentDateTime, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              invoiceId,
              customer.id,
              null,
              null,
              invoiceData.invoiceNumber,
              amount,
              subtotal,
              tax,
              0,
              'generated',
              JSON.stringify(invoiceData.items),
              pdfPath,
              customer.name,
              customer.email,
              customer.phone,
              packageName,
              designName,
              paymentMethod,
              paymentDateTime,
              createdAt,
              createdAt,
            ],
            (err) => {
              if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                  console.warn(`[Seed] Invoice ${invoiceData.invoiceNumber} already exists`);
                } else {
                  console.error(`[Seed] Error inserting invoice ${invoiceData.invoiceNumber}:`, err.message);
                }
              } else {
                console.log(
                  `[Seed] Created invoice ${invoiceData.invoiceNumber} for ${customer.name} - ${designName} - ₹${amount} - PDF: ${path.basename(pdfPath)}`
                );
                created++;
              }
              resolve();
            }
          );
        });
      } catch (pdfError) {
        console.error(`[Seed] PDF generation error for ${invoiceData.invoiceNumber}:`, pdfError.message);
      }
    }

    console.log(`[Seed] Completed. Created ${created} sample invoices from existing customers, bookings, designs, and packages.`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error);
    process.exit(1);
  }
});
