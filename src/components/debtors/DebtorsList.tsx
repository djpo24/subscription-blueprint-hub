
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

  // Improved filtering logic - the database function now handles most of the filtering
  // We only need to exclude explicitly paid debts
  const filteredDebts = debts.filter(debt => {
    // The database function already filters for relevant debts
    // Only exclude if explicitly marked as 'paid'
    const shouldInclude = debt.debt_status !== 'paid' && debt.pending_amount > 0;
    
    if (!shouldInclude) {
      console.log(`🚫 Excluding debt ${debt.tracking_number}: status=${debt.debt_status}, pending=${debt.pending_amount}`);
    }
    
    return shouldInclude;
  });
  
  console.log('🔍 Filtered debts (after client-side filtering):', filteredDebts);
  console.log('📊 Filtered debts count:', filteredDebts.length);

  // Enhanced logging for verification
  const deliveredDebts = filteredDebts.filter(debt => debt.package_status === 'delivered');
  const undeliveredDebts = filteredDebts.filter(debt => debt.package_status !== 'delivered');
  
  console.log('📦 Delivered packages with debt:', deliveredDebts.length);
  console.log('📦 Undelivered packages with debt:', undeliveredDebts.length);

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

  console.log('🔄 Sorted debts:', sortedDebts.length);

  const formatCurrency = (value: number | string, currency: string = 'COP') => {
    const symbol = currency === 'AWG' ? 'ƒ' : '$';
    return `${symbol}${Number(value || 0).toLocaleString('es-CO')}`;
  };

  const getCurrencyLabel = (currency: string) => {
    switch (currency) {
      case 'AWG':
        return 'AWG';
      case 'COP':
        return 'COP';
      default:
        return currency || 'COP';
    }
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
        return status || 'Pendiente';
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
              Las deudas se generan automáticamente cuando los paquetes tienen monto a cobrar pendiente.
            </p>
          </div>
        )}
        {sortedDebts.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <p>
              Mostrando {deliveredDebts.length} paquetes entregados sin pago completo 
              y {undeliveredDebts.length} paquetes pendientes de entrega
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
          getCurrencyLabel={getCurrencyLabel}
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
          getCurrencyLabel={getCurrencyLabel}
          getDebtTypeLabel={getDebtTypeLabel}
          getDebtTypeColor={getDebtTypeColor}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      </CardContent>
    </Card>
  );
}
