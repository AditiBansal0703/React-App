import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../config/db';

const defaultQueryConfig = {
  staleTime: 1000 * 60 * 5, // 5 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

export function useApi(endpoint, options = {}) {
  const queryClient = useQueryClient();

  const fetchData = async ({ queryKey }) => {
    const [, params] = queryKey;
    const response = await fetch(`${endpoint}${params ? `?${new URLSearchParams(params)}` : ''}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  };

  const createData = async (data) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  };

  const updateData = async ({ id, ...data }) => {
    const response = await fetch(`${endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  };

  const query = useQuery({
    queryKey: [endpoint, options.params],
    queryFn: fetchData,
    ...defaultQueryConfig,
    ...options.query,
  });

  const createMutation = useMutation({
    mutationFn: createData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    ...options.createMutation,
  });

  const updateMutation = useMutation({
    mutationFn: updateData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    ...options.updateMutation,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    createLoading: createMutation.isLoading,
    updateLoading: updateMutation.isLoading,
    refetch: query.refetch,
  };
}