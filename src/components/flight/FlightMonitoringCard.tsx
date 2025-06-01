
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Play, Clock, CheckCircle, BarChart3, Zap } from 'lucide-react';
import { useFlightMonitor } from '@/hooks/useFlightMonitor';

export function FlightMonitoringCard() {
  const { startMonitoring, isMonitoring } = useFlightMonitor();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Monitoreo Inteligente de Vuelos
            </CardTitle>
            <CardDescription>
              Sistema optimizado que minimiza el uso de API con estrategias inteligentes
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
              <h4 className="font-medium text-green-900">Monitoreo Automático Inteligente Activo</h4>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-800">
              <Clock className="h-4 w-4" />
              <span>Se ejecuta automáticamente cada 15 minutos con optimizaciones</span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              El sistema usa estrategias inteligentes para minimizar el uso de la API de AviationStack.
            </p>
          </div>

          {/* Optimization features */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estrategias de Optimización Activas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Solo vuelos de hoy:</strong> Solo consulta API para vuelos del día actual
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Caché de 2 horas:</strong> Reutiliza datos recientes para evitar consultas repetidas
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Límite diario:</strong> Máximo 4 consultas API por día (de 100 mensuales)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Sistema de prioridad:</strong> Vuelos con más paquetes tienen mayor prioridad
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Fallback inteligente:</strong> Genera datos realistas cuando no se usa API
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <strong>Horarios realistas:</strong> Calcula horarios basados en el número de vuelo
                </div>
              </div>
            </div>
          </div>

          {/* Usage info */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">📊 Eficiencia de Uso</h4>
            <p className="text-sm text-amber-800">
              Con estas optimizaciones, el sistema puede manejar cientos de vuelos mensuales usando solo 100 consultas API, 
              priorizando los vuelos más importantes y manteniendo la precisión donde más importa.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
