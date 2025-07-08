
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTripNotifications } from '@/hooks/useTripNotifications';
import { useTrips } from '@/hooks/useTrips';
import { CreateTripNotificationDialog } from './CreateTripNotificationDialog';
import { TripNotificationsTable } from './TripNotificationsTable';
import { TripNotificationTestDialog } from './TripNotificationTestDialog';
import { Plus, Send, Calendar, Users, TestTube } from 'lucide-react';

export function TripNotificationsManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const { notifications, isLoading } = useTripNotifications();
  const { data: trips = [] } = useTrips();

  const draftNotifications = notifications.filter(n => n.status === 'draft');
  const sentNotifications = notifications.filter(n => n.status === 'sent');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notificaciones de Viajes</h2>
          <p className="text-gray-500">
            Gestiona notificaciones automáticas para viajes de ida y vuelta
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsTestDialogOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Prueba de Mensaje
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Notificación
          </Button>
        </div>
      </div>

      {/* Test Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TestTube className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Mensaje de Prueba Recomendado</h3>
              <p className="text-sm text-blue-700 mt-1">
                Antes de enviar notificaciones masivas, usa el botón "Prueba de Mensaje" para verificar que la plantilla funcione correctamente en un número específico.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notificaciones</CardTitle>
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
              {sentNotifications.reduce((acc, n) => acc + n.success_count, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <TripNotificationsTable 
            notifications={notifications} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <CreateTripNotificationDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        trips={trips}
      />

      <TripNotificationTestDialog
        isOpen={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
      />
    </div>
  );
}
