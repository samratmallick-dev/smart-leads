import { useCallback, useEffect, useMemo, useState } from 'react';
import { leadsService } from '@/services/leadsService';
import { extractErrorMessage } from '@/lib/errorUtils';
import type { Lead, LeadFilters, PaginatedResponse } from '@/types';

export function useLeads(filters: LeadFilters) {
  const [state, setState] = useState<{
    data: Lead[];
    total: number;
    page: number;
    totalPages: number;
    loading: boolean;
    error: string | null;
  }>({ data: [], total: 0, page: 1, totalPages: 1, loading: true, error: null });

  const stableFilters = useMemo(
    () => filters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.status, filters.source, filters.search, filters.sort, filters.page]
  );

  const fetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res: PaginatedResponse<Lead> = await leadsService.getLeads(stableFilters);
      setState({
        data: res.data,
        total: res.total,
        page: res.page,
        totalPages: res.totalPages,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      console.error('[useLeads] fetch error:', err);
      const msg = extractErrorMessage(err, 'Failed to fetch leads');
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, [stableFilters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
