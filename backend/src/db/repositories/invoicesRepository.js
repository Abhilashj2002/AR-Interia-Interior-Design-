// Database repository for invoices.
// Uses sqlite compatibility exports that delegate to server/db.js during migration.

import { getAsync, allAsync, runAsync } from '../sqlite.js';

export const listInvoices = async () => {
  try {
    return await allAsync('SELECT * FROM invoices ORDER BY datetime(createdAt) DESC', []);
  } catch (error) {
    console.error('[Invoices Repository] listInvoices error:', error);
    return [];
  }
};

export const listInvoicesByCustomerId = async (customerId) => {
  try {
    return await allAsync('SELECT * FROM invoices WHERE customerId = ? ORDER BY datetime(createdAt) DESC', [customerId]);
  } catch (error) {
    console.error('[Invoices Repository] listInvoicesByCustomerId error:', error);
    return [];
  }
};

export const findInvoiceById = async (id) => {
  try {
    return await getAsync('SELECT * FROM invoices WHERE id = ?', [id]);
  } catch (error) {
    console.error('[Invoices Repository] findInvoiceById error:', error);
    return null;
  }
};

export const upsertInvoiceStatus = async (id, status) => {
  try {
    return await runAsync('UPDATE invoices SET status = ? WHERE id = ?', [status, id]);
  } catch (error) {
    console.error('[Invoices Repository] upsertInvoiceStatus error:', error);
    throw error;
  }
};

export const executeInvoiceQuery = {
  getAsync,
  allAsync,
  runAsync
};
