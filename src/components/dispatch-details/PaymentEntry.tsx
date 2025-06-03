
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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
  canRemove?: boolean;
}

export function PaymentEntry({ payment, index, onUpdate, onRemove, canRemove = true }: PaymentEntryProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Pago #{index + 1}</span>
          {canRemove && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Moneda</Label>
            <Select
              value={payment.currency}
              onValueChange={(value) => onUpdate(index, 'currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AWG">Florín (AWG)</SelectItem>
                <SelectItem value="COP">Peso (COP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Monto</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={payment.amount}
              onChange={(e) => onUpdate(index, 'amount', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        {payment.amount && (
          <div className="mt-2 text-sm text-gray-600">
            Tipo de pago: <span className="font-medium">
              {payment.type === 'full' ? 'Completo' : 'Parcial'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
