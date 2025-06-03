
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MobileDeliveryFormFieldsProps {
  deliveredBy: string;
  setDeliveredBy: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  hideDeliveredBy?: boolean;
}

export function MobileDeliveryFormFields({
  deliveredBy,
  setDeliveredBy,
  notes,
  setNotes,
  hideDeliveredBy = false
}: MobileDeliveryFormFieldsProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmar Entrega</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivered By - Solo mostrar si no está oculto */}
        {!hideDeliveredBy && (
          <div>
            <Label htmlFor="deliveredBy">Entregado por *</Label>
            <Input
              id="deliveredBy"
              value={deliveredBy}
              onChange={(e) => setDeliveredBy(e.target.value)}
              placeholder="Nombre de quien entrega"
              required
              className="mt-1"
            />
          </div>
        )}

        {/* Notes Section */}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            className="mb-2 w-full justify-between"
          >
            <span>Agregar notas (opcional)</span>
            {showNotes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
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
                className="mt-1"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
