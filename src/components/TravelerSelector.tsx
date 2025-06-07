
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, UserCheck } from 'lucide-react';
import { useAvailableTravelers } from '@/hooks/useTravelers';

interface TravelerSelectorProps {
  selectedTravelerId: string;
  onTravelerChange: (travelerId: string) => void;
  onAddNewTraveler: () => void;
}

export function TravelerSelector({ selectedTravelerId, onTravelerChange, onAddNewTraveler }: TravelerSelectorProps) {
  const { data: travelers = [], isLoading } = useAvailableTravelers();

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
                <div className="flex items-center gap-2">
                  <UserCheck className="h-3 w-3 text-green-600" />
                  <span>
                    {traveler.first_name} {traveler.last_name} - {traveler.phone}
                    {traveler.user_profiles && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({traveler.user_profiles.email})
                      </span>
                    )}
                  </span>
                </div>
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
      {travelers.length > 0 && (
        <div className="text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <UserCheck className="h-3 w-3 text-green-600" />
            <span>Todos los viajeros están vinculados a usuarios del sistema</span>
          </div>
        </div>
      )}
    </div>
  );
}
