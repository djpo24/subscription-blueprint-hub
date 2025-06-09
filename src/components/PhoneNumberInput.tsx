
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountryCodeSelector } from './CountryCodeSelector';
import { formatPhoneNumber, parsePhoneNumber, getMaxPhoneLength } from '@/utils/phoneFormatter';

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
    
    // Only allow numeric input and formatting characters
    const numericValue = value.replace(/[^\d\s]/g, '');
    
    // Get max length for current country
    const maxLength = getMaxPhoneLength(countryCode);
    const numbersOnly = numericValue.replace(/\D/g, '');
    
    // Don't allow input beyond max length
    if (numbersOnly.length > maxLength) {
      return;
    }
    
    const formatted = formatPhoneNumber(numericValue, countryCode);
    const raw = parsePhoneNumber(formatted);
    onPhoneNumberChange(raw);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numeric input
    if (!/[\d\s]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const getFormattedPhone = () => {
    return formatPhoneNumber(phoneNumber, countryCode);
  };

  const getPlaceholderText = () => {
    if (countryCode === '+57') {
      return 'XXX XXXX (7 dígitos)';
    } else if (countryCode === '+599') {
      return 'XXX XXXXX (7-8 dígitos)';
    } else if (countryCode === '+52') {
      return 'XXX XXXX (7 dígitos)';
    }
    return placeholder;
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
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholderText()}
          className={`flex-1 ${className || ''}`}
          required={required}
          inputMode="numeric"
          pattern="[0-9\s]*"
        />
      </div>
    </div>
  );
}
