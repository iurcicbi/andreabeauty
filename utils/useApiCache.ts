/**
 * Hook personalizzato per gestire la cache delle API
 * Riduce le chiamate ridondanti e migliora le performance
 */

import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000; // 5 minuti

  set<T>(key: string, data: T, expiry?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.DEFAULT_EXPIRY
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

const apiCache = new ApiCache();

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    expiry?: number;
    enabled?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { expiry, enabled = true } = options;

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Controlla cache prima
    if (!force) {
      const cached = apiCache.get<T>(key);
      if (cached) {
        setData(cached);
        return cached;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      apiCache.set(key, result, expiry);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, expiry, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    apiCache.set(key, newData, expiry);
    setData(newData);
  }, [key, expiry]);

  const invalidate = useCallback(() => {
    apiCache.delete(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    mutate,
    invalidate
  };
}

export { apiCache };