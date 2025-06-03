
import { Button } from '@/components/ui/button';
import { Plus, Plane, Bell, Smartphone, Package } from 'lucide-react';

interface QuickActionsProps {
  onNewPackage: () => void;
  onNewTrip: () => void;
  onViewNotifications: () => void;
  onMobileDelivery: () => void;
}

export function QuickActions({ 
  onNewPackage, 
  onNewTrip, 
  onViewNotifications,
  onMobileDelivery
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        onClick={onNewPackage} 
        variant="outline" 
        className="h-auto p-4 flex flex-col items-center gap-2"
      >
        <Plus className="h-6 w-6" />
        <span className="text-sm">Nueva Encomienda</span>
      </Button>
      
      <Button 
        onClick={onNewTrip} 
        variant="outline" 
        className="h-auto p-4 flex flex-col items-center gap-2"
      >
        <Plane className="h-6 w-6" />
        <span className="text-sm">Nuevo Viaje</span>
      </Button>
      
      <Button 
        onClick={onMobileDelivery} 
        variant="outline" 
        className="h-auto p-4 flex flex-col items-center gap-2"
      >
        <Smartphone className="h-6 w-6" />
        <span className="text-sm">Entrega Móvil</span>
      </Button>
      
      <Button 
        onClick={onViewNotifications} 
        variant="outline" 
        className="h-auto p-4 flex flex-col items-center gap-2"
      >
        <Bell className="h-6 w-6" />
        <span className="text-sm">Notificaciones</span>
      </Button>
    </div>
  );
}
