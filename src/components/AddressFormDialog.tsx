
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { locationData, Country, Department, City } from '@/types/LocationData';
import { MapPin, Edit } from 'lucide-react';
import { CountryStep } from './AddressForm/CountryStep';
import { DepartmentStep } from './AddressForm/DepartmentStep';
import { CityStep } from './AddressForm/CityStep';
import { AddressStep } from './AddressForm/AddressStep';

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

  const renderCurrentStep = () => {
    switch (step) {
      case 'country':
        return <CountryStep onCountrySelect={handleCountrySelect} />;
      
      case 'department':
        return selectedLocation.country && (
          <DepartmentStep
            country={selectedLocation.country}
            onDepartmentSelect={handleDepartmentSelect}
            onBackToCountry={() => setStep('country')}
          />
        );
      
      case 'city':
        return selectedLocation.department && (
          <CityStep
            department={selectedLocation.department}
            onCitySelect={handleCitySelect}
            onBackToDepartment={() => setStep('department')}
          />
        );
      
      case 'address':
        return selectedLocation.country && (
          <AddressStep
            country={selectedLocation.country}
            city={selectedLocation.city}
            addressInput={addressInput}
            onAddressInputChange={setAddressInput}
            onAddressSubmit={handleAddressSubmit}
            onCancel={() => setIsOpen(false)}
            onBackToCity={selectedLocation.country.id !== 'CW' ? () => setStep('city') : undefined}
            onBackToCountry={selectedLocation.country.id === 'CW' ? () => setStep('country') : undefined}
          />
        );
      
      default:
        return null;
    }
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
            {renderCurrentStep()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
