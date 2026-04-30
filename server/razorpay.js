import axios from 'axios';
import crypto from 'crypto';

// Razorpay credentials (should be in .env file in production)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_key';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret';
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

const isRazorpayConfigured = () => {
  const kid = RAZORPAY_KEY_ID || '';
  const ksec = RAZORPAY_KEY_SECRET || '';
  return (
    Boolean(kid)
    && Boolean(ksec)
    && !kid.includes('YOUR_')
    && !ksec.includes('YOUR_')
    && !kid.includes('rzp_test_key')
    && !ksec.includes('rzp_test_secret')
  );
};

// Create Razorpay order for payment
export const createOrder = async (amount, customerId, designId, bookingId) => {
  try {
    if (!isRazorpayConfigured()) {
      return {
        success: false,
        error: 'Razorpay is not configured on the server'
      };
    }
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `booking-${bookingId}`,
      notes: {
        customerId,
        designId,
        bookingId
      }
    };

    const response = await axios.post(
      `${RAZORPAY_API_URL}/orders`,
      orderData,
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET
        },
        timeout: 10000
      }
    );

    return {
      success: true,
      orderId: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency
    };
  } catch (error) {
    const statusCode = error?.response?.status;
    const friendlyError = statusCode === 401
      ? 'Razorpay credentials are invalid or not configured on the server'
      : error.message;
    console.error('Error creating Razorpay order:', friendlyError);
    return {
      success: false,
      error: friendlyError
    };
  }
};

// Verify payment signature
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

// Fetch payment details
export const fetchPaymentDetails = async (paymentId) => {
  try {
    const response = await axios.get(
      `${RAZORPAY_API_URL}/payments/${paymentId}`,
      {
        auth: {
          username: RAZORPAY_KEY_ID,
          password: RAZORPAY_KEY_SECRET
        },
        timeout: 10000
      }
    );

    return {
      success: true,
      payment: response.data
    };
  } catch (error) {
    console.error('Error fetching payment:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

export { RAZORPAY_KEY_ID, isRazorpayConfigured };

