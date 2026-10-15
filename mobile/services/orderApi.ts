import { makeRequest, GetToken } from './apiClient';

export interface OrderItem {
  order_item_id?: string;
  order_id?: string;
  prod_id: string;
  quantity: number;
  price_at_purchase?: number;
  // Included by getOrderById
  prod_name?: string;
  prod_cat?: string;
}

export interface Order {
  order_id: string;
  cust_id: string;
  order_total: number;
  order_status: 'pending' | 'completed' | 'cancelled';
  created_at: string;

  // From joins
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  items?: OrderItem[];
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Order API ────────────────────────────────────────────────────────────────

export const orderApi = {
  getAll: (getToken: GetToken, page: number = 1, limit: number = 20, search?: string) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (search) params.set('search', search);
    const qs = params.toString();
    return makeRequest<OrdersResponse>(getToken, '/api/orders' + (qs ? '?' + qs : ''));
  },

  getById: (getToken: GetToken, id: string) =>
    makeRequest<{ success: boolean; data: Order }>(getToken, `/api/orders/${id}`),

  create: (getToken: GetToken, body: { cust_id: string; items: OrderItem[] }) =>
    makeRequest<{ success: boolean; data: Order }>(getToken, '/api/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  delete: (getToken: GetToken, id: string) =>
    makeRequest<{ success: boolean; message: string }>(getToken, `/api/orders/${id}`, {
      method: 'DELETE',
    }),
};
