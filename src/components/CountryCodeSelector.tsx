
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countryCodes } from '@/types/CustomerFormData';

interface CountryCodeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function CountryCodeSelector({ value, onValueChange, className }: CountryCodeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((country, index) => (
          <SelectItem key={`${country.code}-${index}`} value={country.code}>
            {country.flag} {country.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
