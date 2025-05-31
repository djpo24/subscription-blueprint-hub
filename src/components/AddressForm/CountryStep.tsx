
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { locationData, Country } from '@/types/LocationData';

interface CountryStepProps {
  onCountrySelect: (countryId: string) => void;
}

export function CountryStep({ onCountrySelect }: CountryStepProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Seleccionar País</h4>
      <Select onValueChange={onCountrySelect}>
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
}
