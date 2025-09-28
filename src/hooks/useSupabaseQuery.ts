import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/lib/errorHandling';

interface UseSupabaseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useSupabaseQuery = (
  table: string,
  query: any,
  options: UseSupabaseQueryOptions = {}
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const {
    enabled = true,
    refetchOnMount = true,
    onSuccess,
    onError
  } = options;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const handledError = handleSupabaseError(err, `consulta na tabela ${table}`);
      setError(handledError);
      onError?.(handledError);
    } finally {
      setLoading(false);
    }
  }, [enabled, query, table, onSuccess, onError]);

  useEffect(() => {
    if (refetchOnMount) {
      fetchData();
    }
  }, [fetchData, refetchOnMount]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useSupabaseMutation = (
  mutationFn: (variables: any) => Promise<any>,
  options: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any, variables: any) => void;
  } = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = useCallback(async (variables: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const handledError = handleSupabaseError(err, "operação");
      setError(handledError);
      options.onError?.(handledError, variables);
      throw handledError;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error
  };
};