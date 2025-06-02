
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

interface DebtorsListHeaderProps {
  sortBy: 'date' | 'amount' | 'days';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'date' | 'amount' | 'days') => void;
}

export function DebtorsListHeader({ sortBy, sortOrder, onSort }: DebtorsListHeaderProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Button
        variant={sortBy === 'days' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSort('days')}
        className="whitespace-nowrap text-xs"
      >
        Días {sortBy === 'days' && (sortOrder === 'desc' ? '↓' : '↑')}
      </Button>
      <Button
        variant={sortBy === 'amount' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSort('amount')}
        className="whitespace-nowrap text-xs"
      >
        Monto {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
      </Button>
      <Button
        variant={sortBy === 'date' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSort('date')}
        className="whitespace-nowrap text-xs"
      >
        Fecha {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
      </Button>
    </div>
  );
}
