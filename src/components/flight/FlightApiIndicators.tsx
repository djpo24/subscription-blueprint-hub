
interface FlightApiIndicatorsProps {
  hasActualTime: boolean;
  hasApiCity: boolean;
  hasApiGateOrTerminal: boolean;
}

export function FlightApiIndicators({ hasActualTime, hasApiCity, hasApiGateOrTerminal }: FlightApiIndicatorsProps) {
  return (
    <div className="mt-2 space-y-1">
      {hasActualTime && (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-xs text-green-600">Hora REAL de API</span>
        </div>
      )}
      {hasApiCity && (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          <span className="text-xs text-blue-600">Ciudad REAL de API</span>
        </div>
      )}
      {hasApiGateOrTerminal && (
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          <span className="text-xs text-purple-600">Info completa de API</span>
        </div>
      )}
    </div>
  );
}
