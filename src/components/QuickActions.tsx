
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Plane, Package, Users, Bell } from 'lucide-react';

interface QuickActionsProps {
  onNewPackage: () => void;
  onNewTrip: () => void;
  onViewNotifications: () => void;
}

export function QuickActions({ onNewPackage, onNewTrip, onViewNotifications }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>
          Gestiona encomiendas, viajes y notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Button onClick={onNewPackage} className="h-20 flex-col">
          <Package className="h-6 w-6 mb-2" />
          Nueva Encomienda
        </Button>
        <Button onClick={onNewTrip} className="h-20 flex-col" variant="outline">
          <Plane className="h-6 w-6 mb-2" />
          Nuevo Viaje
        </Button>
        <Button onClick={onViewNotifications} className="h-20 flex-col" variant="outline">
          <Bell className="h-6 w-6 mb-2" />
          Notificaciones
        </Button>
        <Button className="h-20 flex-col" variant="outline">
          <Users className="h-6 w-6 mb-2" />
          Ver Clientes
        </Button>
      </CardContent>
    </Card>
  );
}
