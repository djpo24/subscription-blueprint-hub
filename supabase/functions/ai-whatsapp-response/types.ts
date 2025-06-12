
export interface CustomerInfo {
  customerFound: boolean;
  customerFirstName: string;
  packagesCount: number;
  packages: any[];
  pendingDeliveryPackages: any[];
  pendingPaymentPackages: any[];
  totalPending: number;
  totalFreight: Record<string, number>;
  currencyBreakdown: Record<string, number>;
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
}
