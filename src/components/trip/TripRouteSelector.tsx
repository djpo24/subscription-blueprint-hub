
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TripRouteSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TripRouteSelector({ value, onValueChange }: TripRouteSelectorProps) {
  return (
    <div>
      <Label htmlFor="route">Viaje</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar viaje" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Barranquilla-Curazao">Barranquilla-Curazao</SelectItem>
          <SelectItem value="Curazao-Barranquilla">Curazao-Barranquilla</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
