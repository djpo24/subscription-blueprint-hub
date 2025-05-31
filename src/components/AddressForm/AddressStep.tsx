
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Country, City } from '@/types/LocationData';

interface AddressStepProps {
  country: Country;
  city?: City;
  addressInput: string;
  onAddressInputChange: (value: string) => void;
  onAddressSubmit: (address: string) => void;
  onCancel: () => void;
  onBackToCity?: () => void;
  onBackToCountry?: () => void;
}

export function AddressStep({ 
  country, 
  city, 
  addressInput, 
  onAddressInputChange, 
  onAddressSubmit, 
  onCancel,
  onBackToCity,
  onBackToCountry
}: AddressStepProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Agregar Dirección</h4>
      {country.id !== 'CW' && onBackToCity && (
        <Button variant="outline" size="sm" onClick={onBackToCity} className="mb-2">
          ← Cambiar Ciudad ({city?.name})
        </Button>
      )}
      {country.id === 'CW' && onBackToCountry && (
        <Button variant="outline" size="sm" onClick={onBackToCountry} className="mb-2">
          ← Cambiar País ({country.name})
        </Button>
      )}
      <div>
        <Label htmlFor="street-address">Dirección Específica</Label>
        <Input
          id="street-address"
          value={addressInput}
          onChange={(e) => onAddressInputChange(e.target.value)}
          placeholder="Ingresa la dirección específica..."
          className="mt-1"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button 
          onClick={() => onAddressSubmit(addressInput)} 
          disabled={!addressInput.trim()}
          className="flex-1"
        >
          Confirmar Dirección
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
