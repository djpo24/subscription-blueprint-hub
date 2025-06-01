
import { FlightDateDisplay } from './FlightDateDisplay';
import { FlightLocationInfo } from './FlightLocationInfo';
import { FlightTimeInfo } from './FlightTimeInfo';
import { FlightApiIndicators } from './FlightApiIndicators';
import { calculateTimeDifference } from './FlightTimeDifferenceCalculator';

interface FlightDetailsGridProps {
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string | null;
  arrivalTime: string | null;
  departureDate: string | null;
  arrivalDate: string | null;
  actualDeparture: string | null;
  actualArrival: string | null;
  scheduledDeparture: string | null;
  scheduledArrival: string | null;
  // Campos completos para mostrar datos reales de la API
  apiDepartureCity?: string | null;
  apiArrivalCity?: string | null;
  apiDepartureAirport?: string | null;
  apiArrivalAirport?: string | null;
  apiDepartureGate?: string | null;
  apiArrivalGate?: string | null;
  apiDepartureTerminal?: string | null;
  apiArrivalTerminal?: string | null;
}

export function FlightDetailsGrid({
  departureAirport,
  arrivalAirport,
  departureTime,
  arrivalTime,
  departureDate,
  arrivalDate,
  actualDeparture,
  actualArrival,
  scheduledDeparture,
  scheduledArrival,
  apiDepartureCity,
  apiArrivalCity,
  apiDepartureAirport,
  apiArrivalAirport,
  apiDepartureGate,
  apiArrivalGate,
  apiDepartureTerminal,
  apiArrivalTerminal
}: FlightDetailsGridProps) {
  
  console.log('FlightDetailsGrid - datos COMPLETOS recibidos:', {
    departureTime,
    arrivalTime,
    actualDeparture,
    actualArrival,
    scheduledDeparture,
    scheduledArrival,
    apiDepartureCity,
    apiArrivalCity,
    apiDepartureAirport,
    apiArrivalAirport,
    apiDepartureGate,
    apiArrivalGate,
    apiDepartureTerminal,
    apiArrivalTerminal
  });
  
  // Calcular diferencias de tiempo
  const departureDiff = calculateTimeDifference(scheduledDeparture, actualDeparture);
  const arrivalDiff = calculateTimeDifference(scheduledArrival, actualArrival);

  // SIEMPRE priorizar horarios REALES de la API sin conversiones
  const displayDepartureTime = actualDeparture || departureTime;
  const displayArrivalTime = actualArrival || arrivalTime;

  // Mostrar información COMPLETA de aeropuertos de la API
  const displayDepartureInfo = {
    city: apiDepartureCity || departureAirport,
    airport: apiDepartureAirport || departureAirport,
    gate: apiDepartureGate,
    terminal: apiDepartureTerminal
  };

  const displayArrivalInfo = {
    city: apiArrivalCity || arrivalAirport,
    airport: apiArrivalAirport || arrivalAirport,
    gate: apiArrivalGate,
    terminal: apiArrivalTerminal
  };

  console.log('🎯 FlightDetailsGrid - información FINAL a mostrar:', {
    displayDepartureTime,
    displayArrivalTime,
    displayDepartureInfo,
    displayArrivalInfo,
    departureDiff,
    arrivalDiff,
    'apiDepartureCity para mostrar': apiDepartureCity,
    'apiArrivalCity para mostrar': apiArrivalCity
  });

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Salida */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información de salida
        </div>
        
        <FlightLocationInfo
          city={displayDepartureInfo.city}
          airport={displayDepartureInfo.airport}
          gate={displayDepartureInfo.gate}
          terminal={displayDepartureInfo.terminal}
          date={<FlightDateDisplay dateTime={departureDate} />}
          apiCity={apiDepartureCity}
        />
        
        <FlightTimeInfo
          displayTime={displayDepartureTime}
          scheduledTime={scheduledDeparture}
          actualTime={actualDeparture}
          timeDiff={departureDiff}
          isActual={!!actualDeparture}
        />
        
        <FlightApiIndicators
          hasActualTime={!!actualDeparture}
          hasApiCity={!!apiDepartureCity}
          hasApiGateOrTerminal={!!(apiDepartureGate || apiDepartureTerminal)}
        />
      </div>

      {/* Llegada */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información de llegada
        </div>
        
        <FlightLocationInfo
          city={displayArrivalInfo.city}
          airport={displayArrivalInfo.airport}
          gate={displayArrivalInfo.gate}
          terminal={displayArrivalInfo.terminal}
          date={<FlightDateDisplay dateTime={arrivalDate} />}
          apiCity={apiArrivalCity}
        />
        
        <FlightTimeInfo
          displayTime={displayArrivalTime}
          scheduledTime={scheduledArrival}
          actualTime={actualArrival}
          timeDiff={arrivalDiff}
          isActual={!!actualArrival}
        />
        
        <FlightApiIndicators
          hasActualTime={!!actualArrival}
          hasApiCity={!!apiArrivalCity}
          hasApiGateOrTerminal={!!(apiArrivalGate || apiArrivalTerminal)}
        />
      </div>
    </div>
  );
}
