/**
 * apiClient.ts
 *
 * A shared fetch wrapper that automatically attaches the Clerk session
 * token to every request's Authorization header.
 *
 * Usage:
 *   import { makeRequest } from '@/services/apiClient';
 *   const data = await makeRequest<MyType>(getToken, '/api/products');
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type GetToken = () => Promise<string | null>;

export async function makeRequest<T>(
  getToken: GetToken,
  path: string,
  init?: RequestInit
): Promise<T> {
  // Get the current Clerk session JWT
  const token = await getToken();

  if (!token) {
    throw new Error('Not authenticated. Please sign in again.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(
      json?.errors?.join(', ') ?? json?.message ?? `Request failed with status ${res.status}`
    );
  }

  return json as T;
}
