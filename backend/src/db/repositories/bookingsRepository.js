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
  const {
    limit = 50,
    offset = 0,
    status,
    statusGroup,
    paymentStatus,
    dateFrom,
    dateTo,
    query,
    categoryId,
    includeTotal = true
  } = options;

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
    COALESCE(b.designName, d.title, pkg.name) as designName,
    d.title as designTitle,
    pkg.name as packageTitle,
    COALESCE(b.designImage, d.previewImage, pkg.image) as designPreviewImage,
    b.designImage as storedDesignImage,
    d.previewImage as linkedDesignImage,
    pkg.image as linkedPackageImage,
    COALESCE(d.categoryId, pkg.category) as categoryId,
    COALESCE(b.price, b.cost, d.price, pkg.discountedPrice, pkg.originalPrice) as price,
    COALESCE(b.cost, d.cost, pkg.discountedPrice, pkg.originalPrice) as cost,
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

    const searchQuery = String(query || '').trim().toLowerCase();
    if (searchQuery) {
      whereConditions.push(`LOWER(COALESCE(b.id, '') || ' ' || COALESCE(b.designName, '') || ' ' || COALESCE(d.title, '') || ' ' || COALESCE(pkg.name, '') || ' ' || COALESCE(c.name, '') || ' ' || COALESCE(c.email, '')) LIKE ?`);
      params.push(`%${searchQuery}%`);
    }

    const requestedCategoryId = String(categoryId || '').trim();
    if (requestedCategoryId && requestedCategoryId !== 'all') {
      whereConditions.push(`COALESCE(d.categoryId, pkg.category) = ?`);
      params.push(requestedCategoryId);
    }

    if (statusGroup) {
      if (statusGroup === 'approved') {
        whereConditions.push('LOWER(b.status) IN (?, ?, ?, ?)');
        params.push('approved', 'confirmed', 'fulfilled', 'completed');
      } else if (statusGroup === 'declined') {
        whereConditions.push('LOWER(b.status) IN (?, ?, ?)');
        params.push('declined', 'cancelled', 'rejected');
      } else if (statusGroup === 'pending') {
        whereConditions.push('(b.status IS NULL OR LOWER(b.status) NOT IN (?, ?, ?, ?, ?, ?, ?))');
        params.push('approved', 'confirmed', 'fulfilled', 'completed', 'declined', 'cancelled', 'rejected');
      }
    } else if (status) {
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
      params.push(String(dateTo).includes('T') ? dateTo : `${dateTo}T23:59:59.999`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countJoins = `
      LEFT JOIN designs d ON b.designId = d.id
      LEFT JOIN packages pkg ON pkg.id = b.designId OR ('package-' || pkg.id) = b.designId
      LEFT JOIN customers c ON b.customerId = c.id
      ${latestPaymentJoin}
    `;
    const summaryResult = await getAsync(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN p.status IN ('paid', 'success', 'completed') THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN p.status IN ('failed', 'error', 'cancelled') THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN p.status IS NULL OR p.status NOT IN ('paid', 'success', 'completed', 'failed', 'error', 'cancelled') THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN LOWER(COALESCE(b.status, 'pending')) IN ('approved', 'confirmed', 'fulfilled', 'completed') THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN p.status IN ('paid', 'success', 'completed') OR LOWER(COALESCE(b.status, 'pending')) IN ('confirmed', 'fulfilled', 'completed') THEN 1 ELSE 0 END) as paidDesigns
      FROM bookings b
      ${countJoins}
      ${whereClause}
    `, params);
    const summary = {
      total: Number(summaryResult?.total || 0),
      paid: Number(summaryResult?.paid || 0),
      pending: Number(summaryResult?.pending || 0),
      failed: Number(summaryResult?.failed || 0),
      approved: Number(summaryResult?.approved || 0),
      paidDesigns: Number(summaryResult?.paidDesigns || 0)
    };
    const total = summary.total;

    // Get paginated results
    const dataQuery = `SELECT ${selectFields} FROM bookings b
      LEFT JOIN designs d ON b.designId = d.id
      LEFT JOIN packages pkg ON pkg.id = b.designId OR ('package-' || pkg.id) = b.designId
      LEFT JOIN customers c ON b.customerId = c.id
      ${latestPaymentJoin}
      ${whereClause}
      ORDER BY CASE WHEN b.id LIKE 'book-%' THEN 1 ELSE 0 END DESC, datetime(b.bookingDate) DESC
      LIMIT ? OFFSET ?`;
    params.push(includeTotal ? limit : limit + 1, offset);

    const queriedRows = await allAsync(dataQuery, params);
    const hasMore = includeTotal ? (offset + limit) < total : (queriedRows || []).length > limit;
    const rows = includeTotal ? (queriedRows || []) : (queriedRows || []).slice(0, limit);

    return {
      bookings: rows || [],
      total: includeTotal ? total : offset + rows.length + (hasMore ? 1 : 0),
      limit,
      offset,
      hasMore,
      summary
    };
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
