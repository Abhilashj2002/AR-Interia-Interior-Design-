// Database repository for bookings.
// Uses sqlite compatibility exports that delegate to server/db.js during migration.

import { getAsync, allAsync, runAsync } from '../sqlite.js';

export const listBookings = async () => {
  try {
    return await allAsync('SELECT * FROM bookings ORDER BY datetime(bookingDate) DESC', []);
  } catch (error) {
    console.error('[Bookings Repository] listBookings error:', error);
    return [];
  }
};

export const listBookingsByCustomerId = async (customerId) => {
  try {
    return await allAsync('SELECT * FROM bookings WHERE customerId = ? ORDER BY datetime(bookingDate) DESC', [customerId]);
  } catch (error) {
    console.error('[Bookings Repository] listBookingsByCustomerId error:', error);
    return [];
  }
};

export const findBookingById = async (id) => {
  try {
    return await getAsync('SELECT * FROM bookings WHERE id = ?', [id]);
  } catch (error) {
    console.error('[Bookings Repository] findBookingById error:', error);
    return null;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    return await runAsync('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
  } catch (error) {
    console.error('[Bookings Repository] updateBookingStatus error:', error);
    throw error;
  }
};

export const listBookingsForApi = async (customerId, options = {}) => {
  const { limit = 50, offset = 0, status, paymentStatus, dateFrom, dateTo } = options;

  // Optimized payment join using window function for better performance
  const latestPaymentJoin = `
    LEFT JOIN (
      SELECT bookingId, id, status,
             ROW_NUMBER() OVER (PARTITION BY bookingId ORDER BY datetime(updatedAt) DESC, datetime(createdAt) DESC, id DESC) as rn
      FROM payments
    ) p ON p.bookingId = b.id AND p.rn = 1
  `;

  const selectFields = `
    b.id, b.customerId as userId, b.designId,
    COALESCE(b.designName, d.title) as designName,
    d.title as designTitle,
    COALESCE(b.designImage, d.previewImage) as designPreviewImage,
    b.designImage as storedDesignImage,
    d.previewImage as linkedDesignImage,
    d.categoryId,
    COALESCE(b.price, b.cost, d.price) as price,
    COALESCE(b.cost, d.cost) as cost,
    b.status, p.id as paymentId, p.status as paymentStatus,
    b.bookingDate as createdAt,
    c.name as customerName, c.email as customerEmail
  `;

  try {
    let whereConditions = [];
    let params = [];

    if (customerId) {
      whereConditions.push('b.customerId = ?');
      params.push(customerId);
    }

    if (status) {
      whereConditions.push('b.status = ?');
      params.push(status);
    }

    if (paymentStatus) {
      if (paymentStatus === 'paid') {
        whereConditions.push('p.status IN (?, ?, ?)');
        params.push('paid', 'success', 'completed');
      } else if (paymentStatus === 'failed') {
        whereConditions.push('p.status IN (?, ?, ?)');
        params.push('failed', 'error', 'cancelled');
      } else if (paymentStatus === 'pending') {
        whereConditions.push('(p.status IS NULL OR p.status NOT IN (?, ?, ?, ?, ?, ?))');
        params.push('paid', 'success', 'completed', 'failed', 'error', 'cancelled');
      }
    }

    if (dateFrom) {
      whereConditions.push('datetime(b.bookingDate) >= datetime(?)');
      params.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push('datetime(b.bookingDate) <= datetime(?)');
      params.push(dateTo);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM bookings b ${latestPaymentJoin.replace('p ON', 'p ON').replace('AND p.rn = 1', 'AND p.rn = 1')} ${whereClause}`;
    const countResult = await getAsync(countQuery, params);
    const total = countResult?.total || 0;

    // Get paginated results
    const dataQuery = `SELECT ${selectFields} FROM bookings b
      LEFT JOIN designs d ON b.designId = d.id
      LEFT JOIN customers c ON b.customerId = c.id
      ${latestPaymentJoin}
      ${whereClause}
      ORDER BY CASE WHEN b.id LIKE 'book-%' THEN 1 ELSE 0 END DESC, datetime(b.bookingDate) DESC
      LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await allAsync(dataQuery, params);

    return { bookings: rows || [], total, limit, offset };
  } catch (error) {
    console.error('[Bookings Repository] listBookingsForApi error:', error);
    throw error;
  }
};

export const setBookingStatus = async (bookingId, status) => {
  try {
    await runAsync('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    return true;
  } catch (error) {
    console.error('[Bookings Repository] setBookingStatus error:', error);
    throw error;
  }
};

export const executeBookingQuery = {
  getAsync,
  allAsync,
  runAsync
};
