
interface FlightInfoHeaderProps {
  apiFlightStatus?: string;
  apiAirlineName?: string;
  apiAircraftRegistration?: string;
}

export function FlightInfoHeader({
  apiFlightStatus,
  apiAirlineName,
  apiAircraftRegistration
}: FlightInfoHeaderProps) {
  if (!apiFlightStatus && !apiAirlineName && !apiAircraftRegistration) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
      {apiFlightStatus && (
        <div>
          <div className="text-sm text-gray-500">Estado del Vuelo</div>
          <div className="font-medium capitalize">{apiFlightStatus}</div>
        </div>
      )}
      {apiAirlineName && (
        <div>
          <div className="text-sm text-gray-500">Aerolínea</div>
          <div className="font-medium">{apiAirlineName}</div>
        </div>
      )}
      {apiAircraftRegistration && (
        <div>
          <div className="text-sm text-gray-500">Aeronave</div>
          <div className="font-medium">{apiAircraftRegistration}</div>
        </div>
      )}
    </div>
  );
}
