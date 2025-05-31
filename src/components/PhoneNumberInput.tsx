
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountryCodeSelector } from './CountryCodeSelector';

interface PhoneNumberInputProps {
  label: string;
  id: string;
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  showCountryCodeSelector?: boolean;
  className?: string;
}

export function PhoneNumberInput({
  label,
  id,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder,
  required = false,
  showCountryCodeSelector = true,
  className
}: PhoneNumberInputProps) {
  return (
    <div>
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <div className="flex gap-2">
        {showCountryCodeSelector ? (
          <CountryCodeSelector
            value={countryCode}
            onValueChange={onCountryCodeChange}
            className="w-24"
          />
        ) : (
          <div className="w-24 flex items-center justify-center border rounded-md bg-gray-100 text-sm">
            {countryCode}
          </div>
        )}
        <Input
          id={id}
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 ${className || ''}`}
          required={required}
        />
      </div>
    </div>
  );
}
