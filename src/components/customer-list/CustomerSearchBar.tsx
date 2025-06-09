
import { useState } from 'react';
import { CustomerSearchInput } from '@/components/CustomerSearchInput';
import { useCustomerSearch } from '@/hooks/useCustomerSearch';

interface CustomerSearchBarProps {
  onCustomerSelect: (customerId: string) => void;
  onClearSearch: () => void;
}

export function CustomerSearchBar({ onCustomerSelect, onClearSearch }: CustomerSearchBarProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const {
    searchTerm,
    showResults,
    filteredCustomers,
    handleCustomerSelect,
    handleSearchChange,
    handleFocus,
    handleBlur
  } = useCustomerSearch(selectedCustomerId, (customerId) => {
    setSelectedCustomerId(customerId);
    onCustomerSelect(customerId);
  });

  const handleClear = () => {
    setSelectedCustomerId('');
    onClearSearch();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <CustomerSearchInput
          searchTerm={searchTerm}
          filteredCustomers={filteredCustomers}
          showResults={showResults}
          onSearchChange={handleSearchChange}
          onCustomerSelect={handleCustomerSelect}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {selectedCustomerId && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
    </div>
  );
}
