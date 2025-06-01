
import { FlightData } from '@/types/flight';
import { Tabs } from '@/components/ui/tabs';
import { useState } from 'react';
import { FlightCardDetails } from './FlightCardDetails';
import { FlightTabsNavigation } from './FlightTabsNavigation';
import { FlightTabsContent } from './FlightTabsContent';

interface FlightStatusDisplayProps {
  flight: FlightData;
}

export function FlightStatusDisplay({ flight }: FlightStatusDisplayProps) {
  const [isTabExpanded, setIsTabExpanded] = useState(false);

  console.log('FlightStatusDisplay datos COMPLETOS del vuelo:', {
    flight_number: flight.flight_number,
    scheduled_departure: flight.scheduled_departure,
    scheduled_arrival: flight.scheduled_arrival,
    actual_departure: flight.actual_departure,
    actual_arrival: flight.actual_arrival,
    status: flight.status,
    has_landed: flight.has_landed,
    airline: flight.airline,
    last_updated: flight.last_updated,
    api_departure_city: flight.api_departure_city,
    api_arrival_city: flight.api_arrival_city,
    api_departure_airport: flight.api_departure_airport,
    api_arrival_airport: flight.api_arrival_airport,
    api_departure_gate: flight.api_departure_gate,
    api_arrival_gate: flight.api_arrival_gate,
    api_departure_terminal: flight.api_departure_terminal,
    api_arrival_terminal: flight.api_arrival_terminal,
    api_aircraft: flight.api_aircraft,
    api_flight_status: flight.api_flight_status
  });

  return (
    <div className="space-y-4">
      {/* Detalles básicos del vuelo */}
      <FlightCardDetails flight={flight} />
      
      <Tabs defaultValue="compact" className="w-full">
        <FlightTabsNavigation />
        <FlightTabsContent 
          flight={flight}
          isTabExpanded={isTabExpanded}
          onToggle={() => setIsTabExpanded(!isTabExpanded)}
        />
      </Tabs>
    </div>
  );
}
