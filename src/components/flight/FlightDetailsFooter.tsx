
import { FlightData } from '@/types/flight';

interface FlightDetailsFooterProps {
  flight: FlightData;
}

export function FlightDetailsFooter({ flight }: FlightDetailsFooterProps) {
  return (
    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
      <div>Se actualizó hace {flight.last_updated ? '6 h 5 min' : 'tiempo desconocido'}</div>
      <div>Fuentes: API FlightAware, Aviación Stack</div>
    </div>
  );
}
