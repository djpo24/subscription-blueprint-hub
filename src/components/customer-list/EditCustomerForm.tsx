
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomerNameFields } from '@/components/CustomerNameFields';
import { CustomerContactFields } from '@/components/CustomerContactFields';
import { CustomerEmailField } from '@/components/CustomerEmailField';
import { CustomerFormData } from '@/types/CustomerFormData';

interface ValidationError {
  field: 'phone' | 'idNumber';
  message: string;
}

interface EditCustomerFormProps {
  formData: CustomerFormData;
  validationError: ValidationError | null;
  isChecking: boolean;
  showEmailField: boolean;
  onFormDataChange: (field: keyof CustomerFormData, value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onIdNumberChange: (value: string) => void;
  onCountryCodeChange: (value: string) => void;
  onToggleEmailField: () => void;
}

export function EditCustomerForm({
  formData,
  validationError,
  isChecking,
  showEmailField,
  onFormDataChange,
  onPhoneNumberChange,
  onIdNumberChange,
  onCountryCodeChange,
  onToggleEmailField
}: EditCustomerFormProps) {
  return (
    <div className="space-y-6">
      <CustomerNameFields
        firstName={formData.firstName}
        lastName={formData.lastName}
        onFirstNameChange={(value) => onFormDataChange('firstName', value)}
        onLastNameChange={(value) => onFormDataChange('lastName', value)}
      />

      <CustomerContactFields
        idNumber={formData.idNumber}
        countryCode={formData.countryCode}
        phoneNumber={formData.phoneNumber}
        validationError={validationError}
        isChecking={isChecking}
        onIdNumberChange={onIdNumberChange}
        onCountryCodeChange={onCountryCodeChange}
        onPhoneNumberChange={onPhoneNumberChange}
      />

      <CustomerEmailField
        email={formData.email}
        showEmailField={showEmailField}
        onEmailChange={(value) => onFormDataChange('email', value)}
        onToggleEmailField={onToggleEmailField}
      />

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => onFormDataChange('address', e.target.value)}
          placeholder="Dirección completa..."
          rows={3}
          className="mt-1"
        />
      </div>
    </div>
  );
}
