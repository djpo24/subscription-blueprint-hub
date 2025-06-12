
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface PaymentEntryData {
  methodId: string;
  amount: string;
  currency: string;
  type: 'full' | 'partial';
}

interface PaymentEntryProps {
  payment: PaymentEntryData;
  index: number;
  onUpdate: (index: number, field: keyof PaymentEntryData, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function PaymentEntry({ payment, index, onUpdate, onRemove, canRemove }: PaymentEntryProps) {
  const { data: paymentMethods = [] } = usePaymentMethods();

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
      {/* Primera fila: Divisa y Método de pago */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Divisa</label>
          <Select 
            value={payment.currency} 
            onValueChange={(value) => onUpdate(index, 'currency', value)}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Divisa" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white border shadow-lg">
              <SelectItem value="COP">COP (Peso)</SelectItem>
              <SelectItem value="AWG">AWG (Florín)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Método</label>
          <Select 
            value={payment.methodId} 
            onValueChange={(value) => onUpdate(index, 'methodId', value)}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white border shadow-lg">
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Segunda fila: Monto (ocupa toda la fila) */}
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Monto</label>
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            value={payment.amount}
            onChange={(e) => onUpdate(index, 'amount', e.target.value)}
            placeholder="0.00"
            className="flex-1 h-14 text-xl font-semibold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            style={{ fontSize: '20px' }}
          />
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemove(index)}
              className="h-14 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
