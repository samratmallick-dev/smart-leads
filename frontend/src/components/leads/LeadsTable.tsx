import { Pencil, Trash2, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StatusBadge from './StatusBadge';
import { useAuth } from '@/context/useAuth';
import { UserRole } from '@/types';
import type { Lead } from '@/types';

interface Props {
  leads: Lead[];
  loading: boolean;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export default function LeadsTable({ leads, loading, onView, onEdit, onDelete }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.Admin;
  const canModify = (lead: Lead) => isAdmin || lead.user?._id === user?.id;
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <svg className="size-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">No leads found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead._id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell className="text-muted-foreground">{lead.email}</TableCell>
              <TableCell><StatusBadge status={lead.status} /></TableCell>
              <TableCell><Badge variant="secondary">{lead.source}</Badge></TableCell>
              <TableCell className="text-muted-foreground">{lead.user?.name ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground text-xs">
                {new Date(lead.createdAt).toLocaleDateString('en-GB')}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => onView(lead)} aria-label="View">
                    <Eye className="size-3.5" />
                  </Button>
                  {canModify(lead) && (
                    <Button variant="ghost" size="icon-xs" onClick={() => onEdit(lead)} aria-label="Edit">
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                  {canModify(lead) && (
                    <Button variant="ghost" size="icon-xs" onClick={() => onDelete(lead)} aria-label="Delete"
                      className="text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
