/**
 * Booking Service - Centralized booking and payment logic
 */

import type { Booking, User } from '../../types';

export const bookingService = {
  /**
   * Create a new booking inquiry
   */
  createInquiry: async (data: any): Promise<any> => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create inquiry');
      return await response.json();
    } catch (error) {
      console.error('Inquiry creation failed:', error);
      throw error;
    }
  },

  /**
   * Get user bookings
   */
  getBookings: async (userId: string): Promise<Booking[]> => {
    try {
      const response = await fetch(`/api/bookings?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return await response.json();
    } catch (error) {
      console.error('Fetch bookings failed:', error);
      return [];
    }
  },

  /**
   * Create payment order
   */
  createPaymentOrder: async (bookingData: any): Promise<any> => {
    try {
      const response = await fetch('/api/payments/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!response.ok) throw new Error('Failed to create payment order');
      return await response.json();
    } catch (error) {
      console.error('Payment order creation failed:', error);
      throw error;
    }
  },

  /**
   * Verify payment
   */
  verifyPayment: async (paymentData: any): Promise<any> => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (!response.ok) throw new Error('Failed to verify payment');
      return await response.json();
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error;
    }
  },

  /**
   * Get booking by ID
   */
  getBookingById: async (bookingId: string): Promise<Booking | null> => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Fetch booking failed:', error);
      return null;
    }
  }
};
