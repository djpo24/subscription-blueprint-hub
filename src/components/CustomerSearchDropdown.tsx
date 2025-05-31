
import { CustomerSearchResult } from './CustomerSearchResult';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number?: string;
}

interface CustomerSearchDropdownProps {
  customers: Customer[];
  searchTerm: string;
  show: boolean;
  onCustomerSelect: (customer: Customer) => void;
}

export function CustomerSearchDropdown({ 
  customers, 
  searchTerm, 
  show, 
  onCustomerSelect 
}: CustomerSearchDropdownProps) {
  if (!show) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
      {customers.length > 0 ? (
        customers.map((customer) => (
          <CustomerSearchResult
            key={customer.id}
            customer={customer}
            onSelect={onCustomerSelect}
          />
        ))
      ) : (
        searchTerm.trim() && (
          <div className="p-3 text-center text-gray-500 text-sm">
            No se encontraron clientes que coincidan con "{searchTerm}"
          </div>
        )
      )}
    </div>
  );
}
