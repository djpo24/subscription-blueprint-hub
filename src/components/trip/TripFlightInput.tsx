
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TripFlightInputProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TripFlightInput({ value, onValueChange }: TripFlightInputProps) {
  return (
    <div>
      <Label htmlFor="flight_number">Número de Vuelo (Opcional)</Label>
      <Input
        id="flight_number"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="AV123"
      />
    </div>
  );
}
