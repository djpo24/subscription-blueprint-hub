
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneNumberInput } from './PhoneNumberInput';
import { AlertCircle } from 'lucide-react';

interface ValidationError {
  field: 'phone' | 'idNumber';
  message: string;
}

interface CustomerContactFieldsProps {
  idNumber: string;
  countryCode: string;
  phoneNumber: string;
  validationError: ValidationError | null;
  isChecking: boolean;
  onIdNumberChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
}

export function CustomerContactFields({
  idNumber,
  countryCode,
  phoneNumber,
  validationError,
  isChecking,
  onIdNumberChange,
  onCountryCodeChange,
  onPhoneNumberChange
}: CustomerContactFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="idNumber">Cédula (Opcional)</Label>
        {validationError?.field === 'idNumber' && (
          <div className="flex items-center gap-2 mt-1 mb-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{validationError.message}</span>
          </div>
        )}
        <div className="relative">
          <Input
            id="idNumber"
            value={idNumber}
            onChange={(e) => onIdNumberChange(e.target.value)}
            placeholder="Número de identificación"
            className={`mt-1 ${validationError?.field === 'idNumber' ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            disabled={isChecking}
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      <div>
        {validationError?.field === 'phone' && (
          <div className="flex items-center gap-2 mb-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{validationError.message}</span>
          </div>
        )}
        <PhoneNumberInput
          label="Teléfono"
          id="phone"
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          onCountryCodeChange={onCountryCodeChange}
          onPhoneNumberChange={onPhoneNumberChange}
          placeholder="Número de teléfono"
          required
          className={validationError?.field === 'phone' ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
      </div>
    </div>
  );
}
