
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
  const handleDepartmentChange = (departmentId: string) => {
    console.log('🟣 DepartmentStep department selected:', departmentId);
    onDepartmentSelect(departmentId);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-lg">Seleccionar Departamento</h4>
      <Button 
        type="button"
        className="bg-black text-white hover:bg-gray-800 mb-4"
        size="sm"
        onClick={(e) => {
          console.log('🟣 DepartmentStep back to country clicked');
          e.preventDefault();
          e.stopPropagation();
          onBackToCountry();
        }}
      >
        ← Cambiar País ({country.name})
      </Button>
      <Select onValueChange={handleDepartmentChange}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Selecciona un departamento" />
        </SelectTrigger>
        <SelectContent className="max-h-[500px] w-full z-[60] bg-white border shadow-lg">
          <ScrollArea className="h-full max-h-[480px]">
            <div className="p-2">
              {country.departments?.map((department) => (
                <SelectItem 
                  key={department.id} 
                  value={department.id}
                  className="py-4 px-4 text-base cursor-pointer hover:bg-gray-100 focus:bg-gray-100 min-h-[48px] flex items-center"
                >
                  {department.name}
                </SelectItem>
              ))}
            </div>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
