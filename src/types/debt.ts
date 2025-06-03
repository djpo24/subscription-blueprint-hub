
export interface DebtRecord {
  package_id: string;
  tracking_number: string;
  customer_name: string;
  customer_phone: string;
  destination: string;
  traveler_name: string;
  amount_to_collect: number;
  pending_amount: number;
  paid_amount: number;
  debt_status: string;
  debt_type: string;
  debt_start_date: string;
  debt_days: number;
  package_status: string;
  freight: number;
  debt_id: string | null;
  delivery_date: string;
  created_at: string;
  currency: string;
}

export interface TravelerStat {
  id: string;
  name: string;
  totalPackages: number;
  totalAmountToCollect: number;
  totalFreight: number;
  deliveredPackages: number;
  pendingPackages: number;
  revenue: number;
  totalCollected: number;
  pendingAmount: number;
}

export interface CollectionStats {
  total_pending: number;
  total_collected: number;
  pending_payment: number;
  overdue_30_days: number;
  total_packages: number;
  delivered_packages: number;
}

export interface DebtDataResult {
  debts: DebtRecord[];
  travelerStats: TravelerStat[];
  collectionStats: CollectionStats;
}
