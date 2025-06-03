
export interface PaymentEntryData {
  methodId: string;
  amount: string;
  currency: string;
  type: 'full' | 'partial';
}

export interface PaymentMethod {
  id: string;
  name: string;
  currency: string;
  symbol: string;
}

export interface ValidPayment {
  method_id: string;
  amount: number;
  currency: string;
  type: 'full' | 'partial';
}
