
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Clock, CheckCircle } from 'lucide-react';
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
            {isMonitoring ? 'Monitoreando...' : 'Monitoreo Manual'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Automatic monitoring status */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Monitoreo Manual Únicamente</h4>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Clock className="h-4 w-4" />
              <span>Se ejecuta automáticamente cada 15 minutos</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              El sistema verifica el estado de todos los vuelos automáticamente y envía notificaciones cuando los vuelos aterrizan.
            </p>
          </div>

          {/* How it works section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona el monitoreo automático?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El sistema verifica automáticamente cada 15 minutos el estado de todos los vuelos activos</li>
              <li>• Cuando un vuelo aterriza, se actualiza el estado automáticamente</li>
              <li>• Se crean notificaciones pendientes para los clientes</li>
              <li>• Las notificaciones se envían automáticamente por WhatsApp</li>
              <li>• También puedes ejecutar un monitoreo manual usando el botón de arriba</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
