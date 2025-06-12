
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

  console.log('💳 [PaymentEntry] Payment data:', payment);
  console.log('💳 [PaymentEntry] Available methods:', paymentMethods);
  console.log('💳 [PaymentEntry] Current methodId:', payment.methodId);
  console.log('💳 [PaymentEntry] Current amount value:', payment.amount);
  console.log('💳 [PaymentEntry] onUpdate function:', typeof onUpdate);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('💰 [PaymentEntry] Amount input changed from:', payment.amount, 'to:', newValue);
    console.log('💰 [PaymentEntry] Calling onUpdate with:', { index, field: 'amount', value: newValue });
    
    // Prevenir comportamiento por defecto del evento
    e.preventDefault();
    
    // Llamar a onUpdate y verificar que se ejecute
    try {
      onUpdate(index, 'amount', newValue);
      console.log('💰 [PaymentEntry] onUpdate called successfully');
    } catch (error) {
      console.error('💰 [PaymentEntry] Error calling onUpdate:', error);
    }
  };

  // También agregar logging cuando el componente se re-renderiza
  console.log('🔄 [PaymentEntry] Component re-rendered with payment amount:', payment.amount);

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
      {/* Primera fila: Divisa y Método de pago */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Divisa</label>
          <Select 
            value={payment.currency} 
            onValueChange={(value) => {
              console.log('💱 [PaymentEntry] Currency changed to:', value);
              onUpdate(index, 'currency', value);
            }}
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
            onValueChange={(value) => {
              console.log('🔧 [PaymentEntry] Method changed to:', value);
              onUpdate(index, 'methodId', value);
            }}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="Seleccionar método" />
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
            type="text"
            inputMode="decimal"
            value={payment.amount}
            onChange={handleAmountChange}
            onFocus={() => console.log('💰 [PaymentEntry] Amount field focused')}
            onBlur={() => console.log('💰 [PaymentEntry] Amount field blurred')}
            onInput={(e) => console.log('💰 [PaymentEntry] onInput event:', (e.target as HTMLInputElement).value)}
            placeholder="0.00"
            className="flex-1 h-14 text-xl font-semibold text-center border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            style={{ fontSize: '20px' }}
            autoComplete="off"
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
