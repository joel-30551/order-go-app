import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { productApi, Product, ProductFilters } from '@/services/productApi';

// ─── useProducts ──────────────────────────────────────────────────────────────

export function useProducts() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 20 });

  const fetchProducts = useCallback(async (filters: ProductFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getAll(getToken, filters);
      setProducts(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { products, loading, error, pagination, fetchProducts };
}

// ─── useProduct ───────────────────────────────────────────────────────────────

export function useProduct() {
  const { getToken } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getById(getToken, id);
      setProduct(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { product, loading, error, fetchProduct, setProduct };
}

// ─── useCreateProduct ─────────────────────────────────────────────────────────

export function useCreateProduct() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(
    async (data: Omit<Product, 'prod_id' | 'created_at'>): Promise<{ data: Product | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await productApi.create(getToken, data);
        return { data: res.data, error: null };
      } catch (e: any) {
        const msg = e.message ?? 'Failed to create product.';
        setError(msg);
        return { data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  return { createProduct, loading, error };
}

// ─── useUpdateProduct ─────────────────────────────────────────────────────────

export function useUpdateProduct() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = useCallback(
    async (id: string, data: Partial<Omit<Product, 'prod_id' | 'created_at'>>): Promise<{ data: Product | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await productApi.update(getToken, id, data);
        return { data: res.data, error: null };
      } catch (e: any) {
        const msg = e.message ?? 'Failed to update product.';
        setError(msg);
        return { data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  return { updateProduct, loading, error };
}

// ─── useDeleteProduct ─────────────────────────────────────────────────────────

export function useDeleteProduct() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProduct = useCallback(async (id: string): Promise<{ success: boolean; error: string | null }> => {
    setLoading(true);
    setError(null);
    try {
      await productApi.delete(getToken, id);
      return { success: true, error: null };
    } catch (e: any) {
      const msg = e.message ?? 'Failed to delete product.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { deleteProduct, loading, error };
}
