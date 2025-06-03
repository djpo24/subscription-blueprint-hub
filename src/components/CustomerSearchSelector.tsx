
import { CustomerSearchSelectorReadOnly } from './CustomerSearchSelectorReadOnly';
import { CustomerSearchSelectorEditable } from './CustomerSearchSelectorEditable';

interface CustomerSearchSelectorProps {
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  readOnly?: boolean;
}

export function CustomerSearchSelector({ 
  selectedCustomerId, 
  onCustomerChange, 
  readOnly = false 
}: CustomerSearchSelectorProps) {
  if (readOnly) {
    return <CustomerSearchSelectorReadOnly selectedCustomerId={selectedCustomerId} />;
  }

  return (
    <CustomerSearchSelectorEditable
      selectedCustomerId={selectedCustomerId}
      onCustomerChange={onCustomerChange}
    />
  );
}
