
export interface RecordPaymentCustomer {
  id: string;
  customer_name: string;
  phone: string;
  total_pending_amount: number;
  package_numbers: string;
}

export interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: RecordPaymentCustomer | null;
  onPaymentRecorded: () => void;
}
