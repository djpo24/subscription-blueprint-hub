
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
  const handleSubmit = (e: React.FormEvent) => {
    console.log('🟠 AddressStep handleSubmit called');
    e.preventDefault();
    e.stopPropagation();
    onAddressSubmit(addressInput);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Agregar Dirección</h4>
      {country.id !== 'CW' && onBackToCity && (
        <Button 
          type="button"
          className="bg-black text-white hover:bg-gray-800 mb-4"
          size="sm" 
          onClick={(e) => {
            console.log('🟠 AddressStep back to city clicked');
            e.preventDefault();
            e.stopPropagation();
            onBackToCity();
          }}
        >
          ← Cambiar Ciudad ({city?.name})
        </Button>
      )}
      {country.id === 'CW' && onBackToCountry && (
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            console.log('🟠 AddressStep back to country clicked');
            e.preventDefault();
            e.stopPropagation();
            onBackToCountry();
          }} 
          className="mb-2"
        >
          ← Cambiar País ({country.name})
        </Button>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="street-address">Dirección Específica</Label>
          <Input
            id="street-address"
            value={addressInput}
            onChange={(e) => {
              console.log('🟠 AddressStep input changed:', e.target.value);
              onAddressInputChange(e.target.value);
            }}
            placeholder="Ingresa la dirección específica..."
            className="mt-1"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button 
            type="submit"
            disabled={!addressInput.trim()}
            className="flex-1"
            onClick={(e) => {
              console.log('🟠 AddressStep confirm button clicked');
              // Let the form submit handle this
            }}
          >
            Confirmar Dirección
          </Button>
          <Button 
            type="button"
            variant="outline" 
            onClick={(e) => {
              console.log('🟠 AddressStep cancel clicked');
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
