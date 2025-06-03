
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DebtorsListTableProps {
  sortedDebts: any[];
  sortBy: 'date' | 'amount' | 'days';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'date' | 'amount' | 'days') => void;
  formatCurrency: (value: number | string, currency?: string) => string;
  getCurrencyLabel: (currency: string) => string;
  getDebtTypeLabel: (debtType: string) => string;
  getDebtTypeColor: (debtType: string) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export function DebtorsListTable({ 
  sortedDebts, 
  sortBy, 
  sortOrder, 
  onSort, 
  formatCurrency, 
  getCurrencyLabel,
  getDebtTypeLabel, 
  getDebtTypeColor, 
  getStatusLabel, 
  getStatusColor 
}: DebtorsListTableProps) {
  const getSortIcon = (field: 'date' | 'amount' | 'days') => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Seguimiento</th>
            <th className="text-left p-3 font-medium">Cliente</th>
            <th className="text-left p-3 font-medium">Destino</th>
            <th className="text-left p-3 font-medium">Viajero</th>
            <th className="text-left p-3 font-medium">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('amount')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Monto Pendiente {getSortIcon('amount')}
              </Button>
            </th>
            <th className="text-left p-3 font-medium">Tipo</th>
            <th className="text-left p-3 font-medium">Estado</th>
            <th className="text-left p-3 font-medium">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('days')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Días Mora {getSortIcon('days')}
              </Button>
            </th>
            <th className="text-left p-3 font-medium">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort('date')}
                className="h-auto p-0 font-medium hover:bg-transparent"
              >
                Fecha Inicio {getSortIcon('date')}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDebts.map((debt) => (
            <tr key={debt.debt_id || debt.package_id} className="border-b hover:bg-gray-50">
              <td className="p-3">
                <div className="font-mono text-sm">{debt.tracking_number}</div>
              </td>
              <td className="p-3">
                <div className="font-medium">{debt.customer_name}</div>
                <div className="text-sm text-gray-500">{debt.customer_phone}</div>
              </td>
              <td className="p-3">
                <div className="text-sm">{debt.destination}</div>
              </td>
              <td className="p-3">
                <div className="text-sm">{debt.traveler_name}</div>
              </td>
              <td className="p-3">
                <div className="font-medium">
                  {formatCurrency(debt.pending_amount, debt.currency)}
                </div>
                <div className="text-xs text-gray-500">
                  {getCurrencyLabel(debt.currency)}
                </div>
              </td>
              <td className="p-3">
                <Badge variant="outline" className={getDebtTypeColor(debt.debt_type)}>
                  {getDebtTypeLabel(debt.debt_type)}
                </Badge>
              </td>
              <td className="p-3">
                <Badge variant="outline" className={getStatusColor(debt.debt_status)}>
                  {getStatusLabel(debt.debt_status)}
                </Badge>
              </td>
              <td className="p-3">
                <div className={`font-medium ${debt.debt_days > 30 ? 'text-red-600' : debt.debt_days > 15 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {debt.debt_days} días
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm">
                  {debt.debt_start_date ? new Date(debt.debt_start_date).toLocaleDateString('es-CO') : 'N/A'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
