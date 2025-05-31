
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

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
          <SelectItem value="Barranquilla-Curazao">
            <div className="flex items-center gap-2">
              <span>Barranquilla</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span>Curazao</span>
            </div>
          </SelectItem>
          <SelectItem value="Curazao-Barranquilla">
            <div className="flex items-center gap-2">
              <span>Curazao</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span>Barranquilla</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
