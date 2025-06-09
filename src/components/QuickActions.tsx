
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';

interface QuickActionsProps {
  onNewPackage: () => void;
  onNewTrip: () => void;
  onViewNotifications: () => void;
  onMobileDelivery: () => void;
}

export function QuickActions({ 
  onMobileDelivery
}: QuickActionsProps) {
  return (
    <div className="flex justify-center">
      <Button 
        onClick={onMobileDelivery} 
        className="h-auto p-6 flex flex-col items-center gap-3 bg-black text-white hover:bg-gray-800 min-w-[200px]"
      >
        <Smartphone className="h-8 w-8" />
        <span className="text-lg font-semibold">Entrega Móvil</span>
      </Button>
    </div>
  );
}
