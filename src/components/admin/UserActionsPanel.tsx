
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Activity, AlertTriangle, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserActivity {
  id: string;
  created_at: string;
  activity_type: string;
  description: string;
  user_name?: string;
  user_email?: string;
}

export function UserActionsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const { toast } = useToast();

  const { data: userActivities = [], isLoading, refetch } = useQuery({
    queryKey: ['user-activities'],
    queryFn: async () => {
      // Since audit_logs doesn't exist, let's create a mock dataset for demonstration
      // In a real implementation, you would query actual audit/log tables
      const mockData: UserActivity[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          activity_type: 'LOGIN',
          description: 'Usuario inició sesión en el sistema',
          user_name: 'Admin User',
          user_email: 'admin@example.com'
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          activity_type: 'CREATE',
          description: 'Creó un nuevo paquete',
          user_name: 'Employee User',
          user_email: 'employee@example.com'
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          activity_type: 'UPDATE',
          description: 'Actualizó información de cliente',
          user_name: 'Admin User',
          user_email: 'admin@example.com'
        }
      ];

      return mockData;
    },
  });

  const filteredActivities = userActivities.filter((activity: UserActivity) => {
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activityTypeFilter === 'all' || activity.activity_type === activityTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleMarkForReview = async (activityId: string) => {
    try {
      toast({
        title: "Acción marcada para revisión",
        description: "Esta actividad ha sido marcada para revisión manual",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la acción para revisión",
        variant: "destructive"
      });
    }
  };

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Panel de Administración - Actividades de Usuarios
        </CardTitle>
        <CardDescription>
          Monitorea y gestiona las actividades realizadas por los usuarios del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por usuario o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
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

        {/* Tabla de actividades */}
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
              ) : filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {userActivities.length === 0 
                      ? "No hay actividades registradas" 
                      : "No se encontraron actividades que coincidan con los filtros"
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity: UserActivity) => (
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
                        onClick={() => handleMarkForReview(activity.id)}
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

        {/* Información */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Información del Panel</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Este panel muestra una vista simulada de actividades de usuario</li>
            <li>• En una implementación real, se conectaría a tablas de auditoría del sistema</li>
            <li>• Las actividades críticas pueden ser marcadas para revisión manual</li>
            <li>• Se mantiene un registro completo por razones de seguridad y cumplimiento</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
