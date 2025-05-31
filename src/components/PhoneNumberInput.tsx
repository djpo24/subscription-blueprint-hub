
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountryCodeSelector } from './CountryCodeSelector';
import { formatPhoneNumber, parsePhoneNumber } from '@/utils/phoneFormatter';

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
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value, countryCode);
    const raw = parsePhoneNumber(formatted);
    onPhoneNumberChange(raw);
  };

  const getFormattedPhone = () => {
    return formatPhoneNumber(phoneNumber, countryCode);
  };

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
          value={getFormattedPhone()}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className={`flex-1 ${className || ''}`}
          required={required}
        />
      </div>
    </div>
  );
}
