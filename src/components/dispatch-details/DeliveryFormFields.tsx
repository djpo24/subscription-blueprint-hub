
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DeliveryFormFieldsProps {
  deliveredBy: string;
  setDeliveredBy: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export function DeliveryFormFields({ 
  deliveredBy, 
  setDeliveredBy, 
  notes, 
  setNotes 
}: DeliveryFormFieldsProps) {
  return (
    <>
      {/* Delivery Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="deliveredBy">Entregado por *</Label>
          <Input
            id="deliveredBy"
            value={deliveredBy}
            onChange={(e) => setDeliveredBy(e.target.value)}
            placeholder="Nombre de quien entrega"
            required
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones adicionales"
          rows={3}
        />
      </div>
    </>
  );
}
