export interface Bulto {
  id: string;
  bulto_number: number;
  trip_id: string;
  created_at: string;
  created_by?: string;
  status: 'open' | 'closed' | 'dispatched';
  total_packages: number;
  notes?: string;
}

export interface PackageWithBulto {
  id: string;
  tracking_number: string;
  bulto_id?: string;
  description: string;
  weight: number | null;
  customers?: {
    name: string;
    email: string;
  };
}

export interface ScannerConnection {
  id: string;
  isConnected: boolean;
  deviceName: string;
  connectedAt?: Date;
}
