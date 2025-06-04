
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Minus } from 'lucide-react';
import { formatNumber, parseFormattedNumber } from '@/utils/numberFormatter';
import type { PaymentEntryData } from '@/types/payment';

interface PaymentEntryProps {
  payment: PaymentEntryData;
  index: number;
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

// Fixed payment methods for delivery form
const DELIVERY_PAYMENT_METHODS = [
  { id: 'efectivo', name: 'Efectivo' },
  { id: 'transferencia', name: 'Transferencia' }
];

export function PaymentEntry({ payment, index, onUpdate, onRemove, canRemove }: PaymentEntryProps) {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    console.log('📝 Input amount change:', rawValue);
    
    // Allow only numbers and format with periods
    const formattedValue = formatNumber(rawValue);
    const numericValue = parseFormattedNumber(formattedValue);
    
    // Update with the raw numeric value (without periods)
    onUpdate(index, 'amount', numericValue);
  };

  const getDisplayAmount = () => {
    if (!payment.amount) return '';
    return formatNumber(payment.amount);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      'AWG': 'ƒ',
      'USD': '$',
      'COP': '$'
    };
    return symbols[currency as keyof typeof symbols] || '$';
  };

  const currencySymbol = getCurrencySymbol(payment.currency);

  return (
    <div className="grid grid-cols-4 gap-2 items-end">
      {/* Currency Selection */}
      <div>
        <Select
          value={payment.currency}
          onValueChange={(value) => onUpdate(index, 'currency', value)}
        >
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['AWG', 'COP'].map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method Selection - Fixed options */}
      <div>
        <Select
          value={payment.methodId || 'efectivo'}
          onValueChange={(value) => onUpdate(index, 'methodId', value)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Seleccionar método" />
          </SelectTrigger>
          <SelectContent>
            {DELIVERY_PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
          {currencySymbol}
        </span>
        <Input
          type="text"
          value={getDisplayAmount()}
          onChange={handleAmountChange}
          className="pl-8 h-10"
          placeholder="0"
        />
      </div>

      {/* Remove Button */}
      <div className="flex justify-center">
        {canRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(index)}
            className="h-10 w-10 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
