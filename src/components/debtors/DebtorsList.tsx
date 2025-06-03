
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DebtorsListTable } from './DebtorsListTable';
import { DebtorsListMobile } from './DebtorsListMobile';

interface DebtorsListProps {
  debts: any[];
}

export function DebtorsList({ debts }: DebtorsListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'days'>('days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  console.log('🏠 DebtorsList received debts:', debts);
  console.log('📊 Total debts count:', debts.length);

  const filteredDebts = debts.filter(debt => debt.debt_status !== 'no_debt' && debt.debt_status !== 'paid');
  
  console.log('🔍 Filtered debts (after removing no_debt and paid):', filteredDebts);
  console.log('📊 Filtered debts count:', filteredDebts.length);

  const sortedDebts = [...filteredDebts]
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

  console.log('🔄 Sorted debts:', sortedDebts);

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
        {sortedDebts.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>No se encontraron deudas activas.</strong>
            </p>
            <p className="text-yellow-600 text-xs mt-1">
              Las deudas se generan automáticamente cuando los paquetes llegan a destino y tienen monto a cobrar.
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <DebtorsListTable
          sortedDebts={sortedDebts}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          formatCurrency={formatCurrency}
          getDebtTypeLabel={getDebtTypeLabel}
          getDebtTypeColor={getDebtTypeColor}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
        
        <DebtorsListMobile
          sortedDebts={sortedDebts}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          formatCurrency={formatCurrency}
          getDebtTypeLabel={getDebtTypeLabel}
          getDebtTypeColor={getDebtTypeColor}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      </CardContent>
    </Card>
  );
}
