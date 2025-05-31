
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OptionalDescriptionFieldProps {
  description: string;
  onChange: (description: string) => void;
}

export function OptionalDescriptionField({ description, onChange }: OptionalDescriptionFieldProps) {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShowDescription(!showDescription)}
        className="mb-2"
      >
        {showDescription ? (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Ocultar descripción
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            Agregar descripción (opcional)
          </>
        )}
      </Button>
      
      {showDescription && (
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Descripción adicional del contenido..."
            rows={3}
          />
        </div>
      )}
    </div>
  );
}
