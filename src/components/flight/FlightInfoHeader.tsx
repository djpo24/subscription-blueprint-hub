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
  return <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
      <div className="flex flex-col">
        {apiFlightStatus && <span className="text-sm font-medium text-gray-900">
            Estado: {apiFlightStatus}
          </span>}
      </div>
      
      <div className="flex flex-col text-center">
        {apiAirlineName && <span className="text-lg font-semibold text-red-600">
            {apiAirlineName}
          </span>}
      </div>
      
      <div className="flex flex-col text-right">
        {apiAircraftRegistration && <span className="text-sm text-gray-600">
            Aeronave: {apiAircraftRegistration}
          </span>}
      </div>
    </div>;
}