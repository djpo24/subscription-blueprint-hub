
interface FlightLocationInfoProps {
  city: string;
  airport?: string | null;
  gate?: string | null;
  terminal?: string | null;
  date: string | null;
}

export function FlightLocationInfo({ city, airport, gate, terminal, date }: FlightLocationInfoProps) {
  return (
    <div className="font-medium mb-2 space-y-1">
      <div>{city} · <span>{date}</span></div>
      {airport && airport !== city && (
        <div className="text-sm text-blue-600">Aeropuerto: {airport}</div>
      )}
      {terminal && (
        <div className="text-sm text-purple-600">Terminal: {terminal}</div>
      )}
      {gate && (
        <div className="text-sm text-orange-600">Gate: {gate}</div>
      )}
    </div>
  );
}
