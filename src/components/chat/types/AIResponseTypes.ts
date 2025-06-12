
export interface AIResponseButtonProps {
  customerMessage: string;
  customerPhone: string;
  customerId?: string | null;
  onSendMessage: (message: string) => void;
}

export interface CustomerInfo {
  found: boolean;
  name: string;
  pendingAmount: number;
  pendingPackages: number;
  transitPackages: number;
}

export interface AIResponseData {
  response: string;
  hasPackageInfo: boolean;
  isFromFallback?: boolean;
  customerInfo?: CustomerInfo;
  interactionId?: string;
}

export interface ResponseFeedbackProps {
  interactionId: string | null;
  feedbackGiven: 'positive' | 'negative' | null;
  isSubmittingFeedback: boolean;
  onFeedback: (feedbackType: 'positive' | 'negative') => void;
}

export interface CustomerInfoDisplayProps {
  customerInfo: CustomerInfo;
  formatCurrency: (amount: number) => string;
}

export interface AIResponseDisplayProps {
  response: string;
  isFromFallback: boolean;
  customerInfo: CustomerInfo | null;
  onCopy: () => void;
  onSend: () => void;
  feedbackComponent: React.ReactNode;
}
