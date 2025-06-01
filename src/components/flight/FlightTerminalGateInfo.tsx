
interface FlightTerminalGateInfoProps {
  departureTerminal: string | null;
  departureGate: string | null;
  arrivalTerminal: string | null;
  arrivalGate: string | null;
  departureAirport: string;
  arrivalAirport: string;
}

export function FlightTerminalGateInfo({
  departureTerminal,
  departureGate,
  arrivalTerminal,
  arrivalGate,
  departureAirport,
  arrivalAirport
}: FlightTerminalGateInfoProps) {
  if (!departureTerminal && !departureGate && !arrivalTerminal && !arrivalGate) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información de Salida */}
        {(departureTerminal || departureGate) && (
          <div>
            <div className="text-sm font-medium text-blue-700 mb-1">
              🛫 Salida - {departureAirport}
            </div>
            <div className="space-y-1">
              {departureTerminal && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Terminal:</span>
                  <span className="text-sm font-bold text-blue-700">
                    {departureTerminal}
                  </span>
                </div>
              )}
              {departureGate && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Puerta:</span>
                  <span className="text-sm font-bold text-blue-700">
                    {departureGate}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información de Llegada */}
        {(arrivalTerminal || arrivalGate) && (
          <div>
            <div className="text-sm font-medium text-green-700 mb-1">
              🛬 Llegada - {arrivalAirport}
            </div>
            <div className="space-y-1">
              {arrivalTerminal && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Terminal:</span>
                  <span className="text-sm font-bold text-green-700">
                    {arrivalTerminal}
                  </span>
                </div>
              )}
              {arrivalGate && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Puerta:</span>
                  <span className="text-sm font-bold text-green-700">
                    {arrivalGate}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
