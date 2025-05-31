import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Plane, Send } from 'lucide-react';
import { FlightCard } from './FlightCard';
import { FlightData } from '@/types/flight';

interface FlightInformationCardProps {
  pendingFlights: FlightData[];
  isLoading: boolean;
  isProcessing: boolean;
  onProcessNotifications: () => void;
  onUpdateFlightStatus: (params: { flightId: string; hasLanded: boolean }) => void;
}

export function FlightInformationCard({ 
  pendingFlights, 
  isLoading, 
  isProcessing, 
  onProcessNotifications, 
  onUpdateFlightStatus 
}: FlightInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Información Detallada de Vuelos
            </CardTitle>
            <CardDescription>
              Estado completo de vuelos monitoreados y notificaciones WhatsApp
            </CardDescription>
          </div>
          <Button 
            onClick={onProcessNotifications}
            disabled={isProcessing || pendingFlights.length === 0}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isProcessing ? 'Procesando...' : 'Procesar Notificaciones'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando información de vuelos...</div>
          </div>
        ) : pendingFlights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay vuelos pendientes de notificación</p>
            <p className="text-sm mt-2">Los vuelos aparecerán aquí cuando se detecten aterrizajes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingFlights.map((flight) => (
              <FlightCard 
                key={flight.id} 
                flight={flight} 
                onUpdateFlightStatus={onUpdateFlightStatus}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
