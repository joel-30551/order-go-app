import { makeRequest, GetToken } from './apiClient';

export type ProductCategory =
  | 'electronics'
  | 'fashion'
  | 'groceries'
  | 'accessories'
  | 'office'
  | 'other';

export interface Product {
  prod_id: string;
  prod_name: string;
  prod_quantity: number;
  prod_cat: ProductCategory;
  prod_price: number;
  created_at: string;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ─── Product API ──────────────────────────────────────────────────────────────

export const productApi = {
  getAll: (getToken: GetToken, filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.page !== undefined) params.set('page', String(filters.page));
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return makeRequest<ProductsResponse>(getToken, `/api/products${qs ? `?${qs}` : ''}`);
  },

  getById: (getToken: GetToken, id: string) =>
    makeRequest<{ success: boolean; data: Product }>(getToken, `/api/products/${id}`),

  create: (getToken: GetToken, body: Omit<Product, 'prod_id' | 'created_at'>) =>
    makeRequest<{ success: boolean; data: Product }>(getToken, '/api/products', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (getToken: GetToken, id: string, body: Partial<Omit<Product, 'prod_id' | 'created_at'>>) =>
    makeRequest<{ success: boolean; data: Product }>(getToken, `/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (getToken: GetToken, id: string) =>
    makeRequest<{ success: boolean; message: string }>(getToken, `/api/products/${id}`, {
      method: 'DELETE',
    }),
};
