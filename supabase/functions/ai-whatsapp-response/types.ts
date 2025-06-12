export interface CustomerInfo {
  customerFound: boolean;
  customerFirstName: string;
  customerId?: string;
  packagesCount: number;
  totalPending: number;
  totalFreight: Record<string, number>;
  currencyBreakdown: Record<string, number>;
  pendingPaymentPackages: Array<{
    tracking_number: string;
    status: string;
    description?: string;
    amount_to_collect: number;
    currency: string;
    totalPaid: number;
    pendingAmount: number;
  }>;
  pendingDeliveryPackages: Array<{
    tracking_number: string;
    status: string;
    origin: string;
    destination: string;
    description?: string;
    freight: number;
    currency: string;
  }>;
}

export interface AIResponseResult {
  response: string;
  hasPackageInfo: boolean;
  isFromFallback: boolean;
  customerInfo: {
    found: boolean;
    name: string;
    pendingAmount: number;
    pendingPackages: number;
    transitPackages: number;
  };
  interactionId: string | null;
  tripsInfo?: {
    destination: string;
    tripsFound: number;
    nextTripDate: string | null;
  };
  wasEscalated?: boolean;
  isAdminResponse?: boolean;
}
