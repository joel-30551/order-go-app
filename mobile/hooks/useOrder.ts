import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { orderApi, Order, OrderItem } from '@/services/orderApi';

// ─── useOrders ─────────────────────────────────────────────────────────────

export function useOrders() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 20 });

  const fetchOrders = useCallback(async (page: number = 1, limit: number = 20, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getAll(getToken, page, limit, search);
      setOrders(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { orders, loading, error, pagination, fetchOrders };
}

// ─── useOrder ──────────────────────────────────────────────────────────────

export function useOrder() {
  const { getToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderApi.getById(getToken, id);
      setOrder(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { order, loading, error, fetchOrder, setOrder };
}

// ─── useCreateOrder ────────────────────────────────────────────────────────

export function useCreateOrder() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useCallback(
    async (data: { cust_id: string; items: OrderItem[] }): Promise<{ data: Order | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await orderApi.create(getToken, data);
        return { data: res.data, error: null };
      } catch (e: any) {
        const msg = e.message ?? 'Failed to create order.';
        setError(msg);
        return { data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  return { createOrder, loading, error };
}

// ─── useDeleteOrder ────────────────────────────────────────────────────────

export function useDeleteOrder() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteOrder = useCallback(async (id: string): Promise<{ success: boolean; error: string | null }> => {
    setLoading(true);
    setError(null);
    try {
      await orderApi.delete(getToken, id);
      return { success: true, error: null };
    } catch (e: any) {
      const msg = e.message ?? 'Failed to delete order.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { deleteOrder, loading, error };
}
