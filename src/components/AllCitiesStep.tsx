
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllCities, CityWithDepartment } from '@/utils/locationUtils';

interface AllCitiesStepProps {
  onCitySelect: (cityId: string) => void;
  onBackToCountry: () => void;
}

export function AllCitiesStep({ onCitySelect, onBackToCountry }: AllCitiesStepProps) {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityWithDepartment | null>(null);
  const allCities = getAllCities();

  const handleCitySelect = (city: CityWithDepartment) => {
    console.log('🟢 AllCitiesStep city selected:', city);
    setSelectedCity(city);
    setOpen(false);
    onCitySelect(city.id);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-lg">Seleccionar Ciudad</h4>
      <Button 
        type="button"
        className="bg-black text-white hover:bg-gray-800 mb-4"
        size="sm"
        onClick={(e) => {
          console.log('🟢 AllCitiesStep back to country clicked');
          e.preventDefault();
          e.stopPropagation();
          onBackToCountry();
        }}
      >
        ← Cambiar País (Colombia)
      </Button>
      
      <div>
        <Label>Ciudad</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12 text-base"
            >
              {selectedCity ? (
                <span>{selectedCity.name} ({selectedCity.departmentName})</span>
              ) : (
                "Buscar ciudad..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar ciudad..." className="h-12" />
              <CommandList className="max-h-[400px] overflow-y-auto">
                <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                <CommandGroup>
                  {allCities.map((city) => (
                    <CommandItem
                      key={city.id}
                      value={`${city.name} ${city.departmentName}`}
                      onSelect={() => handleCitySelect(city)}
                      className="py-3 px-4 text-base cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCity?.id === city.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{city.name}</span>
                        <span className="text-sm text-gray-500">{city.departmentName}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
