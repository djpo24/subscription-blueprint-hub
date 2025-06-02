
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUpDown, Calendar, DollarSign, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DebtorsListProps {
  debts: any[];
}

export function DebtorsList({ debts }: DebtorsListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'days'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedDebts = [...debts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.debt_start_date).getTime() - new Date(b.debt_start_date).getTime();
        break;
      case 'amount':
        comparison = Number(a.pending_amount) - Number(b.pending_amount);
        break;
      case 'days':
        const aDays = calculateDebtDays(a.debt_start_date);
        const bDays = calculateDebtDays(b.debt_start_date);
        comparison = aDays - bDays;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  function calculateDebtDays(debtStartDate: string | null): number {
    if (!debtStartDate) return 0;
    const daysDiff = Math.floor((new Date().getTime() - new Date(debtStartDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysDiff);
  }

  const formatCurrency = (value: number | string) => {
    return `$${Number(value).toLocaleString('es-CO')}`;
  };

  const getDebtTypeLabel = (debtType: string) => {
    return debtType === 'uncollected' ? 'No recogido' : 'Entregado sin pagar';
  };

  const getDebtTypeColor = (debtType: string) => {
    return debtType === 'uncollected' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const handleSort = (field: 'date' | 'amount' | 'days') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Deudores</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('date')}
                  className="h-auto p-0 font-semibold"
                >
                  Fecha Deuda <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('days')}
                  className="h-auto p-0 font-semibold"
                >
                  Días <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('amount')}
                  className="h-auto p-0 font-semibold"
                >
                  Monto <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Pagado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedDebts.map((debt) => {
              const debtDays = calculateDebtDays(debt.debt_start_date);
              const package_info = debt.packages;
              
              return (
                <TableRow key={debt.id}>
                  <TableCell className="font-medium">
                    {package_info?.tracking_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{package_info?.customers?.name}</div>
                      <div className="text-sm text-gray-500">{package_info?.customers?.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{package_info?.destination}</TableCell>
                  <TableCell>
                    {debt.debt_start_date ? 
                      format(new Date(debt.debt_start_date), 'dd/MM/yyyy', { locale: es }) 
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${debtDays > 30 ? 'text-red-600' : debtDays > 15 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {debtDays}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
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
                    <Badge className={getStatusColor(debt.status)}>
                      {debt.status === 'paid' ? 'Pagado' : debt.status === 'partial' ? 'Parcial' : 'Pendiente'}
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
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
