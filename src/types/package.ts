
export interface PackageFilters {
  status?: string;
  destination?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface Package {
  id: string;
  tracking_number: string;
  description: string;
  weight: number;
  destination: string;
  status: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
}
