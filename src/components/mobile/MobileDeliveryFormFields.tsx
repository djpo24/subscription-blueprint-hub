
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
    <div className="space-y-4">
      {/* Delivered By Field - only show if not hidden */}
      {!hideDeliveredBy && (
        <div className="space-y-2">
          <Label htmlFor="deliveredBy">Entregado por</Label>
          <Input
            id="deliveredBy"
            value={deliveredBy}
            onChange={(e) => setDeliveredBy(e.target.value)}
            placeholder="Nombre de quien entrega"
          />
        </div>
      )}

      {/* Notes Section */}
      <Card>
        <CardHeader className="pb-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center justify-between w-full p-0 h-auto"
          >
            <CardTitle className="text-sm">Notas adicionales</CardTitle>
            {showNotes ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        {showNotes && (
          <CardContent className="pt-0">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre la entrega..."
              className="min-h-[80px]"
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
