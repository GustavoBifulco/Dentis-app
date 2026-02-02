import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';

export function useApi() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  const request = useCallback(async (endpoint: string, options: any = {}) => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Erro na requisição');
      return await res.json();
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return { request, loading };
}