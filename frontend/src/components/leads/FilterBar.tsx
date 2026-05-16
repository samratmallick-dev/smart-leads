import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadSource, LeadStatus } from '@/types';
import type { LeadFilters } from '@/types';

const ALL = 'all';

interface Props {
  filters: LeadFilters;
  search: string;
  onSearchChange: (v: string) => void;
  onFilterChange: (key: keyof LeadFilters, value: string) => void;
}

export default function FilterBar({ filters, search, onSearchChange, onFilterChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          className="pl-9 border border-input rounded"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select
        value={filters.status || ALL}
        onValueChange={(v) => onFilterChange('status', v === ALL ? '' : v)}
      >
        <SelectTrigger className="w-36 border border-input rounded px-3">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Statuses</SelectItem>
          {Object.values(LeadStatus).map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.source || ALL}
        onValueChange={(v) => onFilterChange('source', v === ALL ? '' : v)}
      >
        <SelectTrigger className="w-36 border border-input rounded px-3">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All Sources</SelectItem>
          {Object.values(LeadSource).map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sort ?? 'desc'}
        onValueChange={(v) => onFilterChange('sort', v)}
      >
        <SelectTrigger className="w-32 border border-input rounded px-3">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Latest</SelectItem>
          <SelectItem value="asc">Oldest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
