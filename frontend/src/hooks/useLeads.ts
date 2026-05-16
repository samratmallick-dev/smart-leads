import { useEffect, useState } from 'react';
import { leadsService } from '@/services/leadsService';
import { extractErrorMessage } from '@/lib/errorUtils';
import type { Lead, LeadFilters, PaginatedResponse } from '@/types';

type State = {
  data: Lead[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
};

const initial: State = { data: [], total: 0, page: 1, totalPages: 1, loading: true, error: null };

export function useLeads(filters: LeadFilters) {
  const [state, setState] = useState<State>(initial);
  const [tick, setTick] = useState(0);

  const { status, source, search, sort, page } = filters;

  useEffect(() => {
    let cancelled = false;

    const fetchLeads = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const res: PaginatedResponse<Lead> = await leadsService.getLeads(filters);
        if (!cancelled) setState({ data: res.data, total: res.total, page: res.page, totalPages: res.totalPages, loading: false, error: null });
      } catch (err: unknown) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: extractErrorMessage(err, 'Failed to fetch leads') }));
      }
    };

    fetchLeads();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, source, search, sort, page, tick]);

  return { ...state, refetch: () => setTick((t) => t + 1) };
}
