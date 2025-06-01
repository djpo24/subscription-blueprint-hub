
import { ChevronUp } from 'lucide-react';
import { FlightData } from '@/types/flight';
import { extractFlightApiData } from './FlightApiDataExtractor';

interface FlightDetailsHeaderProps {
  flight: FlightData;
  isExpanded: boolean;
  onToggle?: () => void;
}

export function FlightDetailsHeader({ flight, isExpanded, onToggle }: FlightDetailsHeaderProps) {
  const { arrivalCity, arrivalAirportApi } = extractFlightApiData(flight);

  // Usar horarios reales de la API cuando estén disponibles
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Formatear tiempo sin conversiones de zona horaria
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      const date = new Date(dateTime);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return dateTime.substring(11, 16) || dateTime;
    }
  };

  // Estado del vuelo
  const getFlightStatus = () => {
    if (flight.has_landed || flight.status === 'arrived') {
      return { label: 'LLEGÓ', color: 'bg-green-100 text-green-800 border-green-300' };
    }
    if (flight.status === 'in_flight') {
      return { label: 'EN VUELO', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
    if (flight.status === 'delayed') {
      return { label: 'RETRASADO', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    return { label: 'PROGRAMADO', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
  };

  const flightStatus = getFlightStatus();
  const arrivalAirportName = arrivalCity || arrivalAirportApi || flight.arrival_airport;
  const arrivalCode = flight.arrival_airport;

  return (
    <div className="p-4 cursor-pointer" onClick={onToggle}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatTime(arrivalTime)}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {flight.airline} {flight.flight_number}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            a {arrivalAirportName} ({arrivalCode})
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${flightStatus.color}`}>
            {flightStatus.label}
          </div>
          <ChevronUp className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
    </div>
  );
}
