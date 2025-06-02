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
      <CardHeader className="px-3 sm:px-6">
        <CardTitle className="text-lg sm:text-xl">
          <span className="hidden sm:inline">Lista de Deudores ({sortedDebts.length} deudas activas)</span>
          <span className="sm:hidden">Deudores ({sortedDebts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {/* Vista de escritorio */}
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
        </div>

        {/* Vista móvil - Cards */}
        <div className="lg:hidden space-y-4 px-3">
          {/* Controles de ordenamiento móvil */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={sortBy === 'days' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('days')}
              className="whitespace-nowrap text-xs"
            >
              Días {sortBy === 'days' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Button>
            <Button
              variant={sortBy === 'amount' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('amount')}
              className="whitespace-nowrap text-xs"
            >
              Monto {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Button>
            <Button
              variant={sortBy === 'date' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('date')}
              className="whitespace-nowrap text-xs"
            >
              Fecha {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
            </Button>
          </div>

          {sortedDebts.map((debt) => (
            <Card key={debt.debt_id || debt.package_id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{debt.tracking_number}</h3>
                    <p className="text-sm text-gray-600 truncate">{debt.customer_name}</p>
                    <p className="text-xs text-gray-500">{debt.customer_phone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <Badge className={`${getDebtTypeColor(debt.debt_type)} text-xs`}>
                      {getDebtTypeLabel(debt.debt_type)}
                    </Badge>
                    <Badge className={`${getStatusColor(debt.debt_status)} text-xs`}>
                      {getStatusLabel(debt.debt_status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Destino</p>
                    <p className="font-medium text-sm truncate">{debt.destination}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Viajero</p>
                    <p className="font-medium text-sm truncate">{debt.traveler_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Días de deuda</p>
                    <p className={`font-medium text-sm ${
                      debt.debt_days > 30 ? 'text-red-600' : 
                      debt.debt_days > 15 ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                      {debt.debt_days || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Fecha deuda</p>
                    <p className="font-medium text-sm">
                      {debt.debt_start_date ? 
                        format(new Date(debt.debt_start_date), 'dd/MM/yy', { locale: es }) 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Pendiente:</span>
                    <span className="font-bold text-red-600">{formatCurrency(debt.pending_amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Pagado:</span>
                    <span className="font-medium text-green-600">{formatCurrency(debt.paid_amount)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <DollarSign className="mr-1 h-3 w-3" />
                    Pagar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs">
                    <Calendar className="mr-1 h-3 w-3" />
                    Historial
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
