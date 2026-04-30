const BASE_URL = process.env.PAYMENT_SMOKE_BASE || 'http://localhost:5175/api';

const registerUser = async () => {
  const stamp = Date.now();
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Package Smoke ${stamp}`,
      email: `package_smoke_${stamp}@test.local`,
      username: `package_smoke_${stamp}`,
      password: 'password123'
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.token || !data?.customer?.id) {
    throw new Error(`Register failed: ${data?.message || response.status}`);
  }

  return { token: data.token, customerId: data.customer.id };
};

const createPackageBooking = async (token, customerId) => {
  const amount = 349000;
  const response = await fetch(`${BASE_URL}/bookings/pay-and-book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      customerId,
      designId: 'package-fullhome-4bhk-villa',
      designName: 'FULL HOME 4BHK VILLA Package',
      amount,
      cost: amount
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.bookingId || !data?.paymentId) {
    throw new Error(`Package pay-and-book failed: ${data?.message || response.status}`);
  }

  return { bookingId: data.bookingId, paymentId: data.paymentId };
};

const completeCardPayment = async (token, bookingId, paymentId) => {
  const response = await fetch(`${BASE_URL}/payments/fake/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      bookingId,
      paymentId,
      cardNumber: '4111111111111111',
      cvv: '123',
      name: 'Package Smoke'
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.success) {
    throw new Error(`Fake card complete failed: ${data?.message || response.status}`);
  }
};

const fetchBooking = async (token, customerId, bookingId) => {
  const response = await fetch(`${BASE_URL}/bookings?customerId=${encodeURIComponent(customerId)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(data?.bookings)) {
    throw new Error(`Bookings fetch failed: ${data?.message || response.status}`);
  }

  return data.bookings.find((item) => String(item?.id || '') === String(bookingId));
};

(async () => {
  try {
    console.log('PACKAGE_PAYMENT_SMOKE_START', BASE_URL);
    const user = await registerUser();
    const created = await createPackageBooking(user.token, user.customerId);
    await completeCardPayment(user.token, created.bookingId, created.paymentId);
    const booking = await fetchBooking(user.token, user.customerId, created.bookingId);

    if (!booking) {
      throw new Error('Booking missing after payment');
    }

    const bookingStatus = String(booking.status || '').toLowerCase();
    const paymentStatus = String(booking.paymentStatus || '').toLowerCase();
    const designId = String(booking.designId || '');

    if (bookingStatus !== 'confirmed' || paymentStatus !== 'paid') {
      throw new Error(`Unexpected status booking=${bookingStatus} payment=${paymentStatus}`);
    }

    if (!designId.startsWith('package-')) {
      throw new Error(`Expected package designId, got: ${designId}`);
    }

    console.log('PACKAGE_PAYMENT_SMOKE_OK', { bookingId: created.bookingId, paymentId: created.paymentId, bookingStatus, paymentStatus, designId });
    process.exitCode = 0;
  } catch (error) {
    console.error('PACKAGE_PAYMENT_SMOKE_FAIL', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
})();
