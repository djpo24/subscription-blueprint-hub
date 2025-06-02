
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
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'days'>('days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedDebts = [...debts]
    .filter(debt => debt.debt_status !== 'no_debt' && debt.debt_status !== 'paid')
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.debt_start_date || 0).getTime() - new Date(b.debt_start_date || 0).getTime();
          break;
        case 'amount':
          comparison = Number(a.pending_amount || 0) - Number(b.pending_amount || 0);
          break;
        case 'days':
          comparison = (a.debt_days || 0) - (b.debt_days || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatCurrency = (value: number | string) => {
    return `$${Number(value || 0).toLocaleString('es-CO')}`;
  };

  const getDebtTypeLabel = (debtType: string) => {
    switch (debtType) {
      case 'uncollected':
        return 'No recogido';
      case 'unpaid':
        return 'Entregado sin pagar';
      default:
        return debtType || 'N/A';
    }
  };

  const getDebtTypeColor = (debtType: string) => {
    switch (debtType) {
      case 'uncollected':
        return 'bg-orange-100 text-orange-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'partial':
        return 'Pago Parcial';
      case 'pending':
        return 'Pendiente';
      default:
        return status || 'N/A';
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
        <CardTitle>Lista de Deudores ({sortedDebts.length} deudas activas)</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
