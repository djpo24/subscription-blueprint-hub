
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TripFlightInputProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TripFlightInput({ value, onValueChange }: TripFlightInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="flight_number" className="text-sm font-medium text-gray-700">
        Número de Vuelo (Opcional)
      </Label>
      <Input
        id="flight_number"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="AV123"
        className="h-12 bg-white border-gray-200 hover:border-gray-300 focus:border-black"
      />
    </div>
  );
}
