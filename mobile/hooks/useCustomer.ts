import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { customerApi, Customer } from '@/services/customerApi';

// ─── useCustomers ─────────────────────────────────────────────────────────────

export function useCustomers() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1, limit: 20 });

  const fetchCustomers = useCallback(async (page: number = 1, limit: number = 20, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.getAll(getToken, page, limit, search);
      setCustomers(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { customers, loading, error, pagination, fetchCustomers };
}

// ─── useCustomer ──────────────────────────────────────────────────────────────

export function useCustomer() {
  const { getToken } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerApi.getById(getToken, id);
      setCustomer(res.data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load customer.');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { customer, loading, error, fetchCustomer, setCustomer };
}

// ─── useCreateCustomer ────────────────────────────────────────────────────────

export function useCreateCustomer() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = useCallback(
    async (data: Omit<Customer, 'customer_id' | 'created_at'>): Promise<{ data: Customer | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await customerApi.create(getToken, data);
        return { data: res.data, error: null };
      } catch (e: any) {
        const msg = e.message ?? 'Failed to create customer.';
        setError(msg);
        return { data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  return { createCustomer, loading, error };
}

// ─── useUpdateCustomer ────────────────────────────────────────────────────────

export function useUpdateCustomer() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCustomer = useCallback(
    async (id: string, data: Partial<Omit<Customer, 'customer_id' | 'created_at'>>): Promise<{ data: Customer | null; error: string | null }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await customerApi.update(getToken, id, data);
        return { data: res.data, error: null };
      } catch (e: any) {
        const msg = e.message ?? 'Failed to update customer.';
        setError(msg);
        return { data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [getToken],
  );

  return { updateCustomer, loading, error };
}

// ─── useDeleteCustomer ────────────────────────────────────────────────────────

export function useDeleteCustomer() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCustomer = useCallback(async (id: string): Promise<{ success: boolean; error: string | null }> => {
    setLoading(true);
    setError(null);
    try {
      await customerApi.delete(getToken, id);
      return { success: true, error: null };
    } catch (e: any) {
      const msg = e.message ?? 'Failed to delete customer.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { deleteCustomer, loading, error };
}
