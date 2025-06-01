
import { FlightData } from '@/types/flight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { extractFlightApiData } from './FlightApiDataExtractor';

interface FlightApiDataSummaryProps {
  flight: FlightData;
}

export function FlightApiDataSummary({ flight }: FlightApiDataSummaryProps) {
  const {
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate,
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi,
    aircraft,
    flightStatusApi
  } = extractFlightApiData(flight);

  // Verificar si tenemos datos reales de la API
  const hasApiData = !!(
    departureCity || arrivalCity || 
    departureAirportApi || arrivalAirportApi ||
    departureTerminal || arrivalTerminal ||
    departureGate || arrivalGate ||
    aircraft || flightStatusApi
  );

  if (!hasApiData) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-yellow-700 flex items-center gap-2">
            ⚠️ Sin Datos de API Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-600">
            No se encontraron datos en tiempo real de la API para este vuelo. 
            Usa el botón "Limpiar Caché" y luego "Consultar API" para obtener información actualizada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-green-700 flex items-center gap-2">
          🌐 Información REAL de la API
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            LIVE DATA
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información de Aeropuertos y Ciudades */}
        {(departureCity || arrivalCity || departureAirportApi || arrivalAirportApi) && (
          <div>
            <h4 className="font-medium text-green-800 mb-2">🏢 Aeropuertos y Ciudades</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {(departureCity || departureAirportApi) && (
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="font-medium text-green-700">🛫 Salida</div>
                  {departureCity && <div>Ciudad: <span className="font-bold">{departureCity}</span></div>}
                  {departureAirportApi && <div>Aeropuerto: <span className="font-bold">{departureAirportApi}</span></div>}
                </div>
              )}
              {(arrivalCity || arrivalAirportApi) && (
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="font-medium text-green-700">🛬 Llegada</div>
                  {arrivalCity && <div>Ciudad: <span className="font-bold">{arrivalCity}</span></div>}
                  {arrivalAirportApi && <div>Aeropuerto: <span className="font-bold">{arrivalAirportApi}</span></div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información de Terminales y Puertas */}
        {(departureTerminal || departureGate || arrivalTerminal || arrivalGate) && (
          <div>
            <h4 className="font-medium text-green-800 mb-2">🚪 Terminales y Puertas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {(departureTerminal || departureGate) && (
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="font-medium text-green-700">🛫 Salida</div>
                  {departureTerminal && (
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">🏢</span>
                      Terminal: <span className="font-bold">{departureTerminal}</span>
                    </div>
                  )}
                  {departureGate && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🚪</span>
                      Puerta: <span className="font-bold">{departureGate}</span>
                    </div>
                  )}
                </div>
              )}
              {(arrivalTerminal || arrivalGate) && (
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="font-medium text-green-700">🛬 Llegada</div>
                  {arrivalTerminal && (
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">🏢</span>
                      Terminal: <span className="font-bold">{arrivalTerminal}</span>
                    </div>
                  )}
                  {arrivalGate && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600">🚪</span>
                      Puerta: <span className="font-bold">{arrivalGate}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información Adicional */}
        {(aircraft || flightStatusApi) && (
          <div>
            <h4 className="font-medium text-green-800 mb-2">✈️ Información Adicional</h4>
            <div className="bg-white p-3 rounded border border-green-200 space-y-2 text-sm">
              {aircraft && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✈️</span>
                  Aeronave: <span className="font-bold">{aircraft}</span>
                </div>
              )}
              {flightStatusApi && (
                <div className="flex items-center gap-2">
                  <span className="text-red-600">📊</span>
                  Estado API: <span className="font-bold">{flightStatusApi}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-green-600 border-t border-green-200 pt-2">
          💡 Esta información proviene directamente de la API de AviationStack en tiempo real
        </div>
      </CardContent>
    </Card>
  );
}
