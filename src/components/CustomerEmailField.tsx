
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

interface CustomerEmailFieldProps {
  email: string;
  showEmailField: boolean;
  onEmailChange: (value: string) => void;
  onToggleEmailField: () => void;
}

export function CustomerEmailField({
  email,
  showEmailField,
  onEmailChange,
  onToggleEmailField
}: CustomerEmailFieldProps) {
  return (
    <div className="space-y-4">
      {!showEmailField ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleEmailField}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Agregar Email (Opcional)
        </Button>
      ) : (
        <div>
          <Label htmlFor="email">Email (Opcional)</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}
