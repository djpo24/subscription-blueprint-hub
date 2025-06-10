
export type Currency = 'COP' | 'AWG';

export interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: Package[];
}

export interface PackageItemProps {
  package: Package;
  onClick: () => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}
