
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play } from 'lucide-react';
import { useFlightMonitor } from '@/hooks/useFlightMonitor';

export function FlightMonitoringCard() {
  const { startMonitoring, isMonitoring } = useFlightMonitor();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Monitoreo Automático de Vuelos
            </CardTitle>
            <CardDescription>
              Sistema automático de seguimiento del estado de vuelos en tiempo real
            </CardDescription>
          </div>
          <Button 
            onClick={() => startMonitoring()}
            disabled={isMonitoring}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Play className="h-4 w-4" />
            {isMonitoring ? 'Monitoreando...' : 'Iniciar Monitoreo'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona el monitoreo?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El sistema verifica automáticamente el estado de todos los vuelos activos</li>
            <li>• Cuando un vuelo aterriza, se actualiza el estado automáticamente</li>
            <li>• Se crean notificaciones pendientes para los clientes</li>
            <li>• Las notificaciones se envían automáticamente por WhatsApp</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
