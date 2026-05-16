import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Lead } from '@/types';
import { leadsService } from '@/services/leadsService';
import { extractErrorMessage } from '@/lib/errorUtils';
import { toast } from 'sonner';

interface Props {
  lead: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmDialog({ lead, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!lead) return;
    setLoading(true);
    try {
      await leadsService.deleteLead(lead._id);
      toast.success('Lead deleted successfully');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('[DeleteConfirmDialog] delete error:', err);
      toast.error(extractErrorMessage(err, 'Failed to delete lead'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Lead</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{lead?.name}</strong>? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
