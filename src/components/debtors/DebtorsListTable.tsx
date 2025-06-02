
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Calendar, DollarSign, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DebtorsListTableProps {
  sortedDebts: any[];
  sortBy: 'date' | 'amount' | 'days';
  sortOrder: 'asc' | 'desc';
  onSort: (field: 'date' | 'amount' | 'days') => void;
  formatCurrency: (value: number | string) => string;
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
  getDebtTypeLabel, 
  getDebtTypeColor, 
  getStatusLabel, 
  getStatusColor 
}: DebtorsListTableProps) {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Viajero</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => onSort('date')}
                className="h-auto p-0 font-semibold"
              >
                Fecha Deuda <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => onSort('days')}
                className="h-auto p-0 font-semibold"
              >
                Días <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => onSort('amount')}
                className="h-auto p-0 font-semibold"
              >
                Pendiente <ArrowUpDown className="ml-1 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Pagado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedDebts.map((debt) => (
            <TableRow key={debt.debt_id || debt.package_id}>
              <TableCell className="font-medium">
                {debt.tracking_number}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{debt.customer_name}</div>
                  <div className="text-sm text-gray-500">{debt.customer_phone}</div>
                </div>
              </TableCell>
              <TableCell>{debt.destination}</TableCell>
              <TableCell className="text-sm">{debt.traveler_name}</TableCell>
              <TableCell>
                {debt.debt_start_date ? 
                  format(new Date(debt.debt_start_date), 'dd/MM/yyyy', { locale: es }) 
                  : 'N/A'
                }
              </TableCell>
              <TableCell>
                <span className={`font-medium ${
                  debt.debt_days > 30 ? 'text-red-600' : 
                  debt.debt_days > 15 ? 'text-orange-600' : 'text-gray-900'
                }`}>
                  {debt.debt_days || 0}
                </span>
              </TableCell>
              <TableCell className="font-medium text-red-600">
                {formatCurrency(debt.pending_amount)}
              </TableCell>
              <TableCell className="text-green-600">
                {formatCurrency(debt.paid_amount)}
              </TableCell>
              <TableCell>
                <Badge className={getDebtTypeColor(debt.debt_type)}>
                  {getDebtTypeLabel(debt.debt_type)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(debt.debt_status)}>
                  {getStatusLabel(debt.debt_status)}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Registrar pago
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver historial
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
