
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';

interface EditUserFormProps {
  formData: {
    first_name: string;
    last_name: string;
    countryCode: string;
    phoneNumber: string;
    role: 'admin' | 'employee' | 'traveler';
    is_active: boolean;
  };
  userEmail: string;
  onFormDataChange: (field: string, value: string | boolean) => void;
}

export function EditUserForm({ formData, userEmail, onFormDataChange }: EditUserFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => onFormDataChange('first_name', e.target.value)}
            placeholder="Nombre"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => onFormDataChange('last_name', e.target.value)}
            placeholder="Apellido"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={userEmail}
          disabled
          className="bg-gray-100"
        />
        <p className="text-sm text-gray-500">El email no se puede modificar</p>
      </div>

      <div className="space-y-2">
        <PhoneNumberInput
          label="Teléfono"
          id="phone"
          countryCode={formData.countryCode}
          phoneNumber={formData.phoneNumber}
          onCountryCodeChange={(value) => onFormDataChange('countryCode', value)}
          onPhoneNumberChange={(value) => onFormDataChange('phoneNumber', value)}
          placeholder="Número de teléfono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol *</Label>
        <Select value={formData.role} onValueChange={(value) => onFormDataChange('role', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="employee">Empleado</SelectItem>
            <SelectItem value="traveler">Viajero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => onFormDataChange('is_active', checked)}
        />
        <Label htmlFor="is_active">Usuario activo</Label>
      </div>
    </div>
  );
}
