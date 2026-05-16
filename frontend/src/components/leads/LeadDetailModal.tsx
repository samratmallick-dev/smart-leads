import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Lead } from '@/types';
import StatusBadge from './StatusBadge';
import { Badge } from '@/components/ui/badge';

interface Props {
  lead: Lead | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function LeadDetailModal({ lead, onClose }: Props) {
  if (!lead) return null;
  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <Row label="Name" value={lead.name} />
          <Row label="Email" value={lead.email} />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={lead.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source</span>
            <Badge variant="secondary">{lead.source}</Badge>
          </div>
          <Row label="Created By" value={lead.user?.name ?? '—'} />
          <Row label="Created At" value={new Date(lead.createdAt).toLocaleString()} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
