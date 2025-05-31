
import { User } from 'lucide-react';
import { isValidEmail, formatPhoneForDisplay, formatNumber } from '@/utils/customerSearchUtils';
import { getCountryFlagByPhone } from '@/utils/countryUtils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number?: string;
}

interface CustomerSearchResultProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
}

export function CustomerSearchResult({ customer, onSelect }: CustomerSearchResultProps) {
  const countryFlag = getCountryFlagByPhone(customer.phone);
  
  return (
    <div
      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
      onClick={() => onSelect(customer)}
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-gray-400" />
        <div className="flex-1">
          <div className="font-medium text-sm">{customer.name}</div>
          <div className="text-xs text-gray-500 space-y-1">
            {isValidEmail(customer.email) && (
              <div>📧 {customer.email}</div>
            )}
            <div className="flex items-center gap-1">
              {countryFlag && <span>{countryFlag}</span>}
              <span>📱 {formatPhoneForDisplay(customer.phone)}</span>
            </div>
            {customer.id_number && (
              <div>🆔 {formatNumber(customer.id_number)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
