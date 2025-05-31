
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

interface TripRouteSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TripRouteSelector({ value, onValueChange }: TripRouteSelectorProps) {
  // Función para convertir el formato visual al formato interno
  const convertToInternalFormat = (visualValue: string) => {
    switch (visualValue) {
      case 'Barranquilla-Curazao':
        return 'Barranquilla -> Curazao';
      case 'Curazao-Barranquilla':
        return 'Curazao -> Barranquilla';
      default:
        return visualValue;
    }
  };

  // Función para convertir el formato interno al formato visual
  const convertToVisualFormat = (internalValue: string) => {
    switch (internalValue) {
      case 'Barranquilla -> Curazao':
        return 'Barranquilla-Curazao';
      case 'Curazao -> Barranquilla':
        return 'Curazao-Barranquilla';
      default:
        return internalValue;
    }
  };

  const handleValueChange = (visualValue: string) => {
    const internalValue = convertToInternalFormat(visualValue);
    onValueChange(internalValue);
  };

  // Convertir el valor interno actual al formato visual para mostrar
  const displayValue = convertToVisualFormat(value);

  return (
    <div className="space-y-2">
      <Label htmlFor="route" className="text-sm font-medium text-black">
        Viaje
      </Label>
      <Select 
        value={displayValue} 
        onValueChange={handleValueChange}
        required
      >
        <SelectTrigger className="h-12 bg-gray-100 border-0 hover:bg-white focus:bg-white focus:ring-2 focus:ring-black rounded-lg">
          <SelectValue placeholder="Seleccionar viaje" />
        </SelectTrigger>
        <SelectContent className="bg-white border-0 shadow-xl rounded-lg">
          <SelectItem value="Barranquilla-Curazao" className="h-12 cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="font-medium text-black">Barranquilla</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-black">Curazao</span>
            </div>
          </SelectItem>
          <SelectItem value="Curazao-Barranquilla" className="h-12 cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="font-medium text-black">Curazao</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-black">Barranquilla</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
