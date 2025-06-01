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
  return;
}