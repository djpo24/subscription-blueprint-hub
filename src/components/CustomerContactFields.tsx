
import { PhoneNumberInput } from './PhoneNumberInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CustomerContactFieldsProps {
  idNumber: string;
  countryCode: string;
  phoneNumber: string;
  validationError: string | null;
  isChecking: boolean;
  onIdNumberChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  phoneReadOnly?: boolean;
}

export function CustomerContactFields({
  idNumber,
  countryCode,
  phoneNumber,
  validationError,
  isChecking,
  onIdNumberChange,
  onCountryCodeChange,
  onPhoneNumberChange,
  phoneReadOnly = false
}: CustomerContactFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="idNumber">Cédula/ID</Label>
        <div className="relative">
          <Input
            id="idNumber"
            value={idNumber}
            onChange={(e) => onIdNumberChange(e.target.value)}
            placeholder="Número de identificación"
            className={validationError ? 'border-red-500' : ''}
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div>
        <PhoneNumberInput
          label="Teléfono"
          id="phone"
          countryCode={countryCode}
          phoneNumber={phoneNumber}
          onCountryCodeChange={onCountryCodeChange}
          onPhoneNumberChange={onPhoneNumberChange}
          placeholder="Número de teléfono"
          required
          showCountryCodeSelector={!phoneReadOnly}
          className={`${validationError ? 'border-red-500' : ''} ${phoneReadOnly ? 'bg-gray-100' : ''}`}
        />
        {phoneReadOnly && (
          <p className="text-xs text-gray-500 mt-1">
            Número pre-cargado desde el chat
          </p>
        )}
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
