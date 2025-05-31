
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

interface TripRouteSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TripRouteSelector({ value, onValueChange }: TripRouteSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="route" className="text-sm font-medium text-gray-700">
        Viaje
      </Label>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        required
      >
        <SelectTrigger className="h-12 bg-white border-gray-200 hover:bg-gray-50">
          <SelectValue placeholder="Seleccionar viaje" />
        </SelectTrigger>
        <SelectContent className="border-gray-200 shadow-xl">
          <SelectItem value="Barranquilla-Curazao" className="h-12 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="font-medium">Barranquilla</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Curazao</span>
            </div>
          </SelectItem>
          <SelectItem value="Curazao-Barranquilla" className="h-12 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="font-medium">Curazao</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Barranquilla</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
