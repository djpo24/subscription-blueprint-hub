
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CustomerSearchDropdown } from './CustomerSearchDropdown';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number?: string;
}

interface CustomerSearchInputProps {
  searchTerm: string;
  filteredCustomers: Customer[];
  showResults: boolean;
  onSearchChange: (value: string) => void;
  onCustomerSelect: (customer: Customer) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export function CustomerSearchInput({
  searchTerm,
  filteredCustomers,
  showResults,
  onSearchChange,
  onCustomerSelect,
  onFocus,
  onBlur
}: CustomerSearchInputProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        id="customer-search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar por nombre, cédula, teléfono o email..."
        className="pl-10"
        onFocus={onFocus}
        onBlur={onBlur}
        required
      />
      
      <CustomerSearchDropdown
        customers={filteredCustomers}
        searchTerm={searchTerm}
        show={showResults}
        onCustomerSelect={onCustomerSelect}
      />
    </div>
  );
}
