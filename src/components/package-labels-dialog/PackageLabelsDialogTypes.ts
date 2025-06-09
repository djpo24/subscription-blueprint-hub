
export interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: string;
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

export interface PackageWithRoute extends Package {
  origin: string;
  destination: string;
  flight_number: string | null;
  created_at: string;
}

export interface PackageLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripDate: Date;
  trips: Trip[];
}

export interface PackageLabelsDialogState {
  selectedPackageIds: Set<string>;
  selectedPrintedPackageIds: Set<string>;
  singleLabelOpen: boolean;
  multipleLabelOpen: boolean;
  selectedPackageForLabel: PackageWithRoute | null;
  packagesForMultipleLabels: PackageWithRoute[];
}
