
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DispatchNotesFieldProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function DispatchNotesField({ notes, onNotesChange }: DispatchNotesFieldProps) {
  return (
    <div>
      <Label htmlFor="notes">Notas (Opcional)</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Agregar notas sobre este despacho..."
        rows={3}
      />
    </div>
  );
}
