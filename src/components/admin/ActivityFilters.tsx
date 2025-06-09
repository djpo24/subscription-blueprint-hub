
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { ActivityType } from './types';

interface ActivityFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activityTypeFilter: ActivityType;
  onActivityTypeChange: (value: ActivityType) => void;
}

export function ActivityFilters({
  searchTerm,
  onSearchChange,
  activityTypeFilter,
  onActivityTypeChange
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por usuario o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={activityTypeFilter} onValueChange={onActivityTypeChange}>
        <SelectTrigger className="w-full sm:w-48">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="CREATE">Creación</SelectItem>
          <SelectItem value="UPDATE">Actualización</SelectItem>
          <SelectItem value="DELETE">Eliminación</SelectItem>
          <SelectItem value="LOGIN">Inicio de sesión</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
