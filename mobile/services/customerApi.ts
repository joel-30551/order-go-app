import { makeRequest, GetToken } from './apiClient';

export interface Customer {
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  created_at: string;
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Customer API ─────────────────────────────────────────────────────────────

export const customerApi = {
  getAll: (getToken: GetToken, page: number = 1, limit: number = 20, search?: string) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    const qs = params.toString();
    return makeRequest<CustomersResponse>(getToken, `/api/customers${qs ? `?${qs}` : ''}`);
  },

  getById: (getToken: GetToken, id: string) =>
    makeRequest<{ success: boolean; data: Customer }>(getToken, `/api/customers/${id}`),

  create: (getToken: GetToken, body: Omit<Customer, 'customer_id' | 'created_at'>) =>
    makeRequest<{ success: boolean; data: Customer }>(getToken, '/api/customers', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (getToken: GetToken, id: string, body: Partial<Omit<Customer, 'customer_id' | 'created_at'>>) =>
    makeRequest<{ success: boolean; data: Customer }>(getToken, `/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (getToken: GetToken, id: string) =>
    makeRequest<{ success: boolean; message: string }>(getToken, `/api/customers/${id}`, {
      method: 'DELETE',
    }),
};
