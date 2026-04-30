// ===== DATABASE: Bookings Queries =====
// Location: backend/src/modules/bookings/
// Tier: DATABASE (SQLite Query Operations)
// Source: backend/src/db/repositories/bookingsRepository.js

import {
  listBookings,
  listBookingsByCustomerId,
  findBookingById,
  updateBookingStatus,
  executeBookingQuery
} from '../../db/index.js';

const { getAsync, allAsync, runAsync } = executeBookingQuery;

export { getAsync, allAsync, runAsync };
export { listBookings, listBookingsByCustomerId, findBookingById, updateBookingStatus };

console.log('[Bookings DB] Module uses backend/src/db repository layer');
