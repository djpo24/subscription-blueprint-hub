
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserActivity } from './types';

interface ActivitiesTableProps {
  activities: UserActivity[];
  isLoading: boolean;
  onMarkForReview: (activityId: string) => void;
}

export function ActivitiesTable({ activities, isLoading, onMarkForReview }: ActivitiesTableProps) {
  const getActivityBadgeColor = (activityType: string) => {
    switch (activityType) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'LOGIN': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                  <span className="ml-2">Cargando actividades...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : activities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No se encontraron actividades que coincidan con los filtros
              </TableCell>
            </TableRow>
          ) : (
            activities.map((activity: UserActivity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {activity.user_name || 'Usuario desconocido'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activity.user_email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getActivityBadgeColor(activity.activity_type)}>
                    {activity.activity_type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate">
                    {activity.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkForReview(activity.id)}
                    className="h-8 w-8 p-0"
                    title="Marcar para revisión"
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
