
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { locationData, Country, Department, City } from '@/types/LocationData';
import { MapPin, Edit } from 'lucide-react';

interface AddressSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

interface SelectedLocation {
  country?: Country;
  department?: Department;
  city?: City;
  address?: string;
}

export function AddressSelector({ value, onChange }: AddressSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({});
  const [step, setStep] = useState<'country' | 'department' | 'city' | 'address'>('country');

  const resetSelection = () => {
    setSelectedLocation({});
    setStep('country');
  };

  const handleCountrySelect = (countryId: string) => {
    const country = locationData.find(c => c.id === countryId);
    setSelectedLocation({ country });
    
    if (country?.id === 'CW') {
      // Curazao no necesita departamento ni ciudad
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
    
    // Construir la dirección completa
    let fullAddress = '';
    if (selectedLocation.country?.id === 'CW') {
      fullAddress = `${selectedLocation.country.name} - ${address}`;
    } else {
      const locationPart = `${selectedLocation.country?.name}-${selectedLocation.department?.name}-${selectedLocation.city?.name}`;
      fullAddress = `${locationPart} - ${address}`;
    }
    
    onChange(fullAddress);
    setIsOpen(false);
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
      <h4 className="font-medium">Seleccionar País</h4>
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
      <h4 className="font-medium">Seleccionar Departamento</h4>
      <Button variant="outline" size="sm" onClick={() => setStep('country')} className="mb-2">
        ← Cambiar País
      </Button>
      <Select onValueChange={handleDepartmentSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un departamento" />
        </SelectTrigger>
        <SelectContent>
          {selectedLocation.country?.departments?.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderCityStep = () => (
    <div className="space-y-4">
      <h4 className="font-medium">Seleccionar Ciudad</h4>
      <Button variant="outline" size="sm" onClick={() => setStep('department')} className="mb-2">
        ← Cambiar Departamento
      </Button>
      <Select onValueChange={handleCitySelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una ciudad" />
        </SelectTrigger>
        <SelectContent>
          {selectedLocation.department?.cities.map((city) => (
            <SelectItem key={city.id} value={city.id}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const renderAddressStep = () => {
    const [addressInput, setAddressInput] = useState('');
    
    return (
      <div className="space-y-4">
        <h4 className="font-medium">Agregar Dirección</h4>
        {selectedLocation.country?.id !== 'CW' && (
          <Button variant="outline" size="sm" onClick={() => setStep('city')} className="mb-2">
            ← Cambiar Ciudad
          </Button>
        )}
        {selectedLocation.country?.id === 'CW' && (
          <Button variant="outline" size="sm" onClick={() => setStep('country')} className="mb-2">
            ← Cambiar País
          </Button>
        )}
        <div>
          <Label htmlFor="street-address">Dirección</Label>
          <Input
            id="street-address"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Ingresa la dirección específica..."
            className="mt-1"
          />
        </div>
        <Button 
          onClick={() => handleAddressSubmit(addressInput)} 
          disabled={!addressInput.trim()}
          className="w-full"
        >
          Confirmar Dirección
        </Button>
      </div>
    );
  };

  return (
    <div>
      <Label htmlFor="address">Dirección (Opcional)</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
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
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          {step === 'country' && renderCountryStep()}
          {step === 'department' && renderDepartmentStep()}
          {step === 'city' && renderCityStep()}
          {step === 'address' && renderAddressStep()}
        </PopoverContent>
      </Popover>
    </div>
  );
}
