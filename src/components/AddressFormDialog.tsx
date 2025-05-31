
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { locationData, Country, Department, City } from '@/types/LocationData';
import { MapPin, Edit } from 'lucide-react';
import { CountryStep } from './AddressForm/CountryStep';
import { AllCitiesStep } from './AddressForm/AllCitiesStep';
import { AddressStep } from './AddressForm/AddressStep';
import { findCityById, findDepartmentByCity } from '@/utils/locationUtils';

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
  const [step, setStep] = useState<'country' | 'city' | 'address'>('country');
  const [addressInput, setAddressInput] = useState('');

  const resetSelection = () => {
    console.log('🔵 AddressFormDialog resetSelection called');
    setSelectedLocation({});
    setStep('country');
    setAddressInput('');
  };

  const handleCountrySelect = (countryId: string) => {
    console.log('🔵 AddressFormDialog handleCountrySelect called with:', countryId);
    const country = locationData.find(c => c.id === countryId);
    setSelectedLocation({ country });
    
    if (country?.id === 'CW') {
      setStep('address');
    } else {
      setStep('city');
    }
  };

  const handleCitySelect = (cityId: string) => {
    console.log('🔵 AddressFormDialog handleCitySelect called with:', cityId);
    const cityWithDept = findCityById(cityId);
    const department = findDepartmentByCity(cityId);
    
    if (cityWithDept && department) {
      const city = { id: cityWithDept.id, name: cityWithDept.name };
      setSelectedLocation(prev => ({ ...prev, city, department }));
      setStep('address');
    }
  };

  const handleAddressSubmit = (address: string) => {
    console.log('🔵 AddressFormDialog handleAddressSubmit called with:', address);
    setSelectedLocation(prev => ({ ...prev, address }));
    
    let fullAddress = '';
    if (selectedLocation.country?.id === 'CW') {
      fullAddress = `${selectedLocation.country.name} - ${address}`;
    } else {
      const locationPart = `${selectedLocation.country?.name}-${selectedLocation.department?.name}-${selectedLocation.city?.name}`;
      fullAddress = `${locationPart} - ${address}`;
    }
    
    console.log('🔵 AddressFormDialog calling onChange with:', fullAddress);
    onChange(fullAddress);
    setIsOpen(false);
    resetSelection();
  };

  const handleDialogTriggerClick = (e: React.MouseEvent) => {
    console.log('🔵 AddressFormDialog trigger clicked');
    e.preventDefault();
    e.stopPropagation();
    resetSelection();
    setIsOpen(true);
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
      
      case 'city':
        return selectedLocation.country && (
          <AllCitiesStep
            onCitySelect={handleCitySelect}
            onBackToCountry={() => setStep('country')}
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
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={handleDialogTriggerClick}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Seleccionar dirección
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-black text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-2"
                    onClick={handleDialogTriggerClick}
                  >
                    {displayData.locationPart}
                    <Edit className="h-3 w-3 cursor-pointer" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600 border rounded px-3 py-2 bg-gray-50">
                  {displayData.addressPart}
                </div>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-2xl h-[85vh] max-h-[800px] backdrop-blur-sm overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Dirección</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex-1 min-h-[600px]">
            {renderCurrentStep()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
