
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTravelers } from '@/hooks/useTravelers';

interface TravelerSelectorProps {
  selectedTravelerId: string;
  onTravelerChange: (travelerId: string) => void;
  onAddNewTraveler: () => void;
}

export function TravelerSelector({ selectedTravelerId, onTravelerChange, onAddNewTraveler }: TravelerSelectorProps) {
  const { data: travelers = [], isLoading } = useTravelers();

  return (
    <div className="space-y-2">
      <Label htmlFor="traveler">Viajero *</Label>
      <div className="flex gap-2">
        <Select 
          value={selectedTravelerId} 
          onValueChange={onTravelerChange}
          required
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={isLoading ? "Cargando..." : "Seleccionar viajero"} />
          </SelectTrigger>
          <SelectContent>
            {travelers.map((traveler) => (
              <SelectItem key={traveler.id} value={traveler.id}>
                {traveler.first_name} {traveler.last_name} - {traveler.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onAddNewTraveler}
          title="Agregar nuevo viajero"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
