
import { DebtorsMobileCard } from './DebtorsMobileCard';
import { DebtorsListHeader } from './DebtorsListHeader';

interface DebtorsListMobileProps {
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

export function DebtorsListMobile({ 
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
}: DebtorsListMobileProps) {
  return (
    <div className="lg:hidden space-y-4 px-3">
      <DebtorsListHeader sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
      
      {sortedDebts.map((debt) => (
        <DebtorsMobileCard
          key={debt.debt_id || debt.package_id}
          debt={debt}
          formatCurrency={formatCurrency}
          getCurrencyLabel={getCurrencyLabel}
          getDebtTypeLabel={getDebtTypeLabel}
          getDebtTypeColor={getDebtTypeColor}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      ))}
    </div>
  );
}
