import { useState } from 'react';
import { Download, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/leads/FilterBar';
import LeadsTable from '@/components/leads/LeadsTable';
import Pagination from '@/components/leads/Pagination';
import LeadModal from '@/components/leads/LeadModal';
import LeadDetailModal from '@/components/leads/LeadDetailModal';
import DeleteConfirmDialog from '@/components/leads/DeleteConfirmDialog';
import { useLeads } from '@/hooks/useLeads';
import { useDebounce } from '@/hooks/useDebounce';
import { leadsService } from '@/services/leadsService';
import { extractErrorMessage } from '@/lib/errorUtils';
import type { Lead, LeadFilters } from '@/types';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [filters, setFilters] = useState<LeadFilters>({ sort: 'desc', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  const activeFilters: LeadFilters = { ...filters, search: debouncedSearch || undefined };
  const { data: leads, loading, error, total, page, totalPages, refetch } = useLeads(activeFilters);

  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);

  const handleFilterChange = (key: keyof LeadFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value || undefined, page: 1 }));
  };

  const handleExport = async () => {
    try {
      const blob = await leadsService.exportCSV(activeFilters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (err: unknown) {
      console.error('[DashboardPage] export error:', err);
      toast.error(extractErrorMessage(err, 'Export failed — please try again'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Leads</h1>
            <p className="text-sm text-muted-foreground">Manage and track your sales leads</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-3.5" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" />
              New Lead
            </Button>
          </div>
        </div>

        <FilterBar
          filters={filters}
          search={searchInput}
          onSearchChange={(v) => { setSearchInput(v); setFilters((f) => ({ ...f, page: 1 })); }}
          onFilterChange={handleFilterChange}
        />

        {error ? (
          <div role="alert" className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded px-4 py-3">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
            <Button variant="ghost" size="xs" className="ml-auto" onClick={refetch}>Retry</Button>
          </div>
        ) : (
          <>
            <LeadsTable
              leads={leads}
              loading={loading}
              onView={setViewLead}
              onEdit={setEditLead}
              onDelete={setDeleteLead}
            />
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
            />
          </>
        )}
      </main>

      <LeadModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={refetch} />
      <LeadModal open={!!editLead} lead={editLead ?? undefined} onClose={() => setEditLead(null)} onSuccess={refetch} />
      <LeadDetailModal lead={viewLead} onClose={() => setViewLead(null)} />
      <DeleteConfirmDialog lead={deleteLead} onClose={() => setDeleteLead(null)} onSuccess={refetch} />
    </div>
  );
}
