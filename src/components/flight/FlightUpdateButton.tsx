
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useFlightInfoUpdate } from '@/hooks/useFlightInfoUpdate';

interface FlightUpdateButtonProps {
  flightNumber: string;
}

export function FlightUpdateButton({ flightNumber }: FlightUpdateButtonProps) {
  const { updateFlightInfo, isUpdating } = useFlightInfoUpdate();

  const handleUpdate = () => {
    updateFlightInfo(flightNumber);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleUpdate}
      disabled={isUpdating}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
      {isUpdating ? 'Actualizando...' : 'Actualizar Info'}
    </Button>
  );
}
