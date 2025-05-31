
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locationData, Country } from '@/types/LocationData';

interface CountryStepProps {
  onCountrySelect: (countryId: string) => void;
}

export function CountryStep({ onCountrySelect }: CountryStepProps) {
  return (
    <div className="space-y-6">
      <h4 className="font-medium text-lg">Seleccionar País</h4>
      <Select onValueChange={onCountrySelect}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Selecciona un país" />
        </SelectTrigger>
        <SelectContent className="w-full">
          {locationData.map((country) => (
            <SelectItem 
              key={country.id} 
              value={country.id}
              className="py-3 px-4 text-base cursor-pointer hover:bg-gray-100"
            >
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
