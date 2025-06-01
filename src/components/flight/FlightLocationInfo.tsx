
interface FlightLocationInfoProps {
  city: string;
  airport?: string | null;
  gate?: string | null;
  terminal?: string | null;
  date: React.ReactNode;
  apiCity?: string | null;
}

export function FlightLocationInfo({ city, airport, gate, terminal, date, apiCity }: FlightLocationInfoProps) {
  console.log('🏙️ FlightLocationInfo recibiendo:', { city, airport, gate, terminal, apiCity });
  
  return (
    <div className="font-medium mb-2 space-y-1">
      <div>{city} · <span>{date}</span></div>
      {apiCity && apiCity !== city && (
        <div className="text-sm text-green-600 font-medium">Ciudad API: {apiCity}</div>
      )}
      {airport && (
        <div className="text-sm text-blue-600">Aeropuerto: {airport}</div>
      )}
      {terminal && (
        <div className="text-sm text-purple-600">Terminal: {terminal}</div>
      )}
      {gate && (
        <div className="text-sm text-orange-600">Puerta: {gate}</div>
      )}
    </div>
  );
}
