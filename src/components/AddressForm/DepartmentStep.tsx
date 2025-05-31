
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
    <div className="space-y-6">
      <h4 className="font-medium text-lg">Seleccionar Departamento</h4>
      <Button variant="outline" size="sm" onClick={onBackToCountry} className="mb-4">
        ← Cambiar País ({country.name})
      </Button>
      <Select onValueChange={onDepartmentSelect}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Selecciona un departamento" />
        </SelectTrigger>
        <SelectContent className="max-h-80 w-full">
          <ScrollArea className="h-full max-h-72">
            {country.departments?.map((department) => (
              <SelectItem 
                key={department.id} 
                value={department.id}
                className="py-3 px-4 text-base cursor-pointer hover:bg-gray-100"
              >
                {department.name}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
