
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerNameFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export function CustomerNameFields({ 
  firstName, 
  lastName, 
  onFirstNameChange, 
  onLastNameChange 
}: CustomerNameFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="firstName">Nombres *</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="lastName">Apellidos *</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          required
          className="mt-1"
        />
      </div>
    </div>
  );
}
