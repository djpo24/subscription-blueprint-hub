
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
  pending_count: number;
  delivered_count: number;
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
  currency: string | null;
  trip_id: string | null;
  delivered_at: string | null;
  delivered_by: string | null;
  customers: {
    name: string;
    email: string;
    phone: string;
  } | null;
}
