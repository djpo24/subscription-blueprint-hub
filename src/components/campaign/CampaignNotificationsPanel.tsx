
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCampaignNotifications } from '@/hooks/useCampaignNotifications';
import { useTrips } from '@/hooks/useTrips';
import { CreateCampaignNotificationDialog } from './CreateCampaignNotificationDialog';
import { CampaignNotificationsTable } from './CampaignNotificationsTable';
import { Plus, Send, Calendar, Users, AlertCircle } from 'lucide-react';

export function CampaignNotificationsPanel() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { notifications, isLoading } = useCampaignNotifications();
  const { data: trips = [] } = useTrips();

  const draftNotifications = notifications.filter(n => n.status === 'draft');
  const sentNotifications = notifications.filter(n => n.status === 'sent');

  // Filtrar viajes activos para obtener fechas
  const activeTrips = trips.filter(trip => 
    trip.status === 'scheduled' || trip.status === 'pending'
  );

  const barranquillaTrips = activeTrips.filter(trip => 
    trip.origin?.toLowerCase().includes('barranquilla')
  );
  
  const curazaoTrips = activeTrips.filter(trip => 
    trip.origin?.toLowerCase().includes('curazao')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaña de Próximos Viajes</h2>
          <p className="text-gray-500">
            Gestiona notificaciones automáticas para informar sobre próximos viajes programados
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Información de viajes disponibles */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Viajes disponibles:</strong> {barranquillaTrips.length} salidas desde Barranquilla, {curazaoTrips.length} retornos desde Curazao
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borradores</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{draftNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éxito Total</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sentNotifications.reduce((acc, n) => acc + (n.success_count || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Campañas</CardTitle>
        </CardHeader>
        <CardContent>
          <CampaignNotificationsTable 
            notifications={notifications} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <CreateCampaignNotificationDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        trips={trips}
      />
    </div>
  );
}
