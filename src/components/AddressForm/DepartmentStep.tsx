
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Country } from '@/types/LocationData';

interface DepartmentStepProps {
  country: Country;
  onDepartmentSelect: (departmentId: string) => void;
  onBackToCountry: () => void;
}

export function DepartmentStep({ country, onDepartmentSelect, onBackToCountry }: DepartmentStepProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-lg">Seleccionar Departamento</h4>
      <Button variant="outline" size="sm" onClick={onBackToCountry} className="mb-2">
        ← Cambiar País ({country.name})
      </Button>
      <Select onValueChange={onDepartmentSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona un departamento" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <ScrollArea className="h-full">
            {country.departments?.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
