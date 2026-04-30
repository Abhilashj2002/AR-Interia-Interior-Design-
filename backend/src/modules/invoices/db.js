// ===== DATABASE: Invoices Queries =====
// Location: backend/src/modules/invoices/
// Tier: DATABASE (SQLite Query Operations)
// Source: backend/src/db/repositories/invoicesRepository.js

import {
  listInvoices,
  listInvoicesByCustomerId,
  findInvoiceById,
  upsertInvoiceStatus,
  executeInvoiceQuery
} from '../../db/index.js';

const { getAsync, allAsync, runAsync } = executeInvoiceQuery;

export { getAsync, allAsync, runAsync };
export { listInvoices, listInvoicesByCustomerId, findInvoiceById, upsertInvoiceStatus };

console.log('[Invoices DB] Module uses backend/src/db repository layer');
