
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Department } from '@/types/LocationData';

interface CityStepProps {
  department: Department;
  onCitySelect: (cityId: string) => void;
  onBackToDepartment: () => void;
}

export function CityStep({ department, onCitySelect, onBackToDepartment }: CityStepProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Seleccionar Ciudad</h4>
      <Button variant="outline" size="sm" onClick={onBackToDepartment} className="mb-2">
        ← Cambiar Departamento ({department.name})
      </Button>
      <Select onValueChange={onCitySelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una ciudad" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <ScrollArea className="h-full">
            {department.cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
