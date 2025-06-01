
interface FlightLocationInfoProps {
  city: string;
  airport?: string | null;
  gate?: string | null;
  terminal?: string | null;
  date: React.ReactNode;
  apiCity?: string | null;
  apiAirport?: string | null;
}

export function FlightLocationInfo({ 
  city, 
  airport, 
  gate, 
  terminal, 
  date, 
  apiCity,
  apiAirport 
}: FlightLocationInfoProps) {
  console.log('🏙️ FlightLocationInfo recibiendo:', { 
    city, 
    airport, 
    gate, 
    terminal, 
    apiCity, 
    apiAirport 
  });
  
  // Priorizar información real de la API
  const displayCity = apiCity || city;
  const displayAirport = apiAirport || airport;
  const hasRealApiData = !!(apiCity || apiAirport || gate || terminal);
  
  return (
    <div className="font-medium mb-2 space-y-1">
      <div className="flex items-center gap-2">
        <span>{displayCity}</span>
        <span>·</span>
        <span>{date}</span>
        {hasRealApiData && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            🌐 API REAL
          </span>
        )}
      </div>
      
      {/* Mostrar información REAL del aeropuerto de la API */}
      {apiAirport && apiAirport !== city && (
        <div className="text-sm text-green-700 font-medium bg-green-50 px-2 py-1 rounded border-l-2 border-green-400">
          🏢 Aeropuerto Real (API): {apiAirport}
        </div>
      )}
      
      {/* Mostrar ciudad real si es diferente */}
      {apiCity && apiCity !== city && apiCity !== apiAirport && (
        <div className="text-sm text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-400">
          🏙️ Ciudad Real (API): {apiCity}
        </div>
      )}
      
      {/* Información de terminal y puerta */}
      <div className="flex gap-2 flex-wrap">
        {terminal && (
          <div className="text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
            🏢 Terminal: <span className="font-bold">{terminal}</span>
          </div>
        )}
        {gate && (
          <div className="text-sm text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-200">
            🚪 Puerta: <span className="font-bold">{gate}</span>
          </div>
        )}
      </div>
      
      {/* Mostrar aeropuerto básico solo si no hay información API específica */}
      {!apiAirport && airport && airport !== city && (
        <div className="text-sm text-gray-600">
          Aeropuerto: {airport}
        </div>
      )}
    </div>
  );
}
