
interface FlightTerminalGateInfoProps {
  gate?: string;
  terminal?: string;
}

export function FlightTerminalGateInfo({ gate, terminal }: FlightTerminalGateInfoProps) {
  if (!gate && !terminal) {
    return null;
  }

  return (
    <div>
      <div className="text-sm text-gray-500">Terminal y Puerta</div>
      <div className="font-medium">
        {terminal && `Terminal ${terminal}`}
        {terminal && gate && ' - '}
        {gate && `Puerta ${gate}`}
      </div>
    </div>
  );
}
