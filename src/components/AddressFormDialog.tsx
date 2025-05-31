import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { locationData, Country, Department, City } from '@/types/LocationData';
import { MapPin, Edit } from 'lucide-react';

interface AddressFormDialogProps {
  value: string;
  onChange: (value: string) => void;
}

interface SelectedLocation {
  country?: Country;
  department?: Department;
  city?: City;
  address?: string;
}

export function AddressFormDialog({ value, onChange }: AddressFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({});
  const [step, setStep] = useState<'country' | 'department' | 'city' | 'address'>('country');
  const [addressInput, setAddressInput] = useState('');

  const resetSelection = () => {
    setSelectedLocation({});
    setStep('country');
    setAddressInput('');
  };

  const handleCountrySelect = (countryId: string) => {
    const country = locationData.find(c => c.id === countryId);
    setSelectedLocation({ country });
    
    if (country?.id === 'CW') {
      setStep('address');
    } else {
      setStep('department');
    }
  };

  const handleDepartmentSelect = (departmentId: string) => {
    const department = selectedLocation.country?.departments?.find(d => d.id === departmentId);
    setSelectedLocation(prev => ({ ...prev, department }));
    setStep('city');
  };

  const handleCitySelect = (cityId: string) => {
    const city = selectedLocation.department?.cities.find(c => c.id === cityId);
    setSelectedLocation(prev => ({ ...prev, city }));
    setStep('address');
  };

  const handleAddressSubmit = (address: string) => {
    setSelectedLocation(prev => ({ ...prev, address }));
    
    let fullAddress = '';
    if (selectedLocation.country?.id === 'CW') {
      fullAddress = `${selectedLocation.country.name} - ${address}`;
    } else {
      const locationPart = `${selectedLocation.country?.name}-${selectedLocation.department?.name}-${selectedLocation.city?.name}`;
      fullAddress = `${locationPart} - ${address}`;
    }
    
    onChange(fullAddress);
    setIsOpen(false);
    resetSelection();
  };

  const getLocationDisplay = () => {
    if (!value) return null;
    
    const parts = value.split(' - ');
    if (parts.length < 2) return null;
    
    const locationPart = parts[0];
    const addressPart = parts.slice(1).join(' - ');
    
    return { locationPart, addressPart };
  };

  const displayData = getLocationDisplay();

  const renderCountryStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Seleccionar País</h4>
      <Select onValueChange={handleCountrySelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un país" />
        </SelectTrigger>
        <SelectContent>
          {locationData.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderDepartmentStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Seleccionar Departamento</h4>
      <Button variant="outline" size="sm" onClick={() => setStep('country')} className="mb-2">
        ← Cambiar País ({selectedLocation.country?.name})
      </Button>
      <Select onValueChange={handleDepartmentSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un departamento" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <ScrollArea className="h-full">
            {selectedLocation.country?.departments?.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );

  const renderCityStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Seleccionar Ciudad</h4>
      <Button variant="outline" size="sm" onClick={() => setStep('department')} className="mb-2">
        ← Cambiar Departamento ({selectedLocation.department?.name})
      </Button>
      <Select onValueChange={handleCitySelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una ciudad" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <ScrollArea className="h-full">
            {selectedLocation.department?.cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );

  const renderAddressStep = () => {
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Agregar Dirección</h4>
        {selectedLocation.country?.id !== 'CW' && (
          <Button variant="outline" size="sm" onClick={() => setStep('city')} className="mb-2">
            ← Cambiar Ciudad ({selectedLocation.city?.name})
          </Button>
        )}
        {selectedLocation.country?.id === 'CW' && (
          <Button variant="outline" size="sm" onClick={() => setStep('country')} className="mb-2">
            ← Cambiar País ({selectedLocation.country?.name})
          </Button>
        )}
        <div>
          <Label htmlFor="street-address">Dirección Específica</Label>
          <Input
            id="street-address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Ingresa la dirección específica..."
            className="mt-1"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={() => handleAddressSubmit(addressInput)} 
            disabled={!addressInput.trim()}
            className="flex-1"
          >
            Confirmar Dirección
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Label htmlFor="address">Dirección (Opcional)</Label>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="mt-1">
            {!displayData ? (
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => {
                  resetSelection();
                  setIsOpen(true);
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Seleccionar dirección
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-black text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-2">
                    {displayData.locationPart}
                    <Edit className="h-3 w-3 cursor-pointer" />
                  </div>
                </div>
                <div className="text-sm text-gray-600 border rounded px-3 py-2 bg-gray-50">
                  {displayData.addressPart}
                </div>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>Configurar Dirección</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {step === 'country' && renderCountryStep()}
            {step === 'department' && renderDepartmentStep()}
            {step === 'city' && renderCityStep()}
            {step === 'address' && renderAddressStep()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
