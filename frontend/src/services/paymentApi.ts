export interface PhonePeCreatePayload {
  bookingId: string;
  paymentId: string;
  userId: string;
  amount: number;
}

export interface PhonePeCreateResponse {
  redirectUrl: string;
  merchantTransactionId: string;
}

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const createPhonePePayment = async (payload: PhonePeCreatePayload, token?: string): Promise<PhonePeCreateResponse> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetchWithTimeout('/api/payments/phonepe/create', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Payment initiation failed.');
  }

  return response.json();
};

export interface PhonePeStatusResponse {
  success: boolean;
  status: 'success' | 'failed' | 'pending';
}

export const fetchPhonePeStatus = async (merchantTransactionId: string, token?: string): Promise<PhonePeStatusResponse> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetchWithTimeout('/api/payments/phonepe/status', {
    method: 'POST',
    headers,
    body: JSON.stringify({ merchantTransactionId })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || 'Payment verification failed.');
  }

  return response.json();
};
