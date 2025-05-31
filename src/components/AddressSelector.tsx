
import { AddressFormDialog } from './AddressFormDialog';

interface AddressSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function AddressSelector({ value, onChange }: AddressSelectorProps) {
  return <AddressFormDialog value={value} onChange={onChange} />;
}
