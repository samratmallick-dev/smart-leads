import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LeadForm from './LeadForm';
import { leadsService } from '@/services/leadsService';
import { extractErrorMessage } from '@/lib/errorUtils';
import type { Lead, CreateLeadInput, UpdateLeadInput } from '@/types';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead?: Lead;
}

export default function LeadModal({ open, onClose, onSuccess, lead }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateLeadInput | UpdateLeadInput) => {
    setLoading(true);
    try {
      if (lead) {
        await leadsService.updateLead(lead._id, values);
        toast.success('Lead updated successfully');
      } else {
        await leadsService.createLead(values as CreateLeadInput);
        toast.success('Lead created successfully');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('[LeadModal] submit error:', err);
      toast.error(extractErrorMessage(err, lead ? 'Failed to update lead' : 'Failed to create lead'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{lead ? 'Edit Lead' : 'New Lead'}</DialogTitle>
        </DialogHeader>
        <LeadForm defaultValues={lead} onSubmit={handleSubmit} loading={loading} />
      </DialogContent>
    </Dialog>
  );
}
