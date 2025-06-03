
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DeliveryFormFieldsProps {
  deliveredBy: string;
  setDeliveredBy: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  hideDeliveredBy?: boolean;
}

export function DeliveryFormFields({ 
  deliveredBy, 
  setDeliveredBy, 
  notes, 
  setNotes,
  hideDeliveredBy = false
}: DeliveryFormFieldsProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <>
      {/* Delivery Info - Solo mostrar si no está oculto */}
      {!hideDeliveredBy && (
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
      )}

      {/* Notes Section */}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNotes(!showNotes)}
          className="mb-2"
        >
          {showNotes ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Ocultar notas
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Agregar notas (opcional)
            </>
          )}
        </Button>
        
        {showNotes && (
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones adicionales"
              rows={3}
            />
          </div>
        )}
      </div>
    </>
  );
}
