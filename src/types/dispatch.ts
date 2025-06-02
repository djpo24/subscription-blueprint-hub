
export interface DispatchRelation {
  id: string;
  dispatch_date: string;
  total_packages: number;
  total_weight: number | null;
  total_freight: number | null;
  total_amount_to_collect: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

export interface PackageInDispatch {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  trip_id: string | null;
  customers: {
    name: string;
    email: string;
  } | null;
}
