
import { FlightData } from '@/types/flight';
import { FlightApiDataSummary } from './FlightApiDataSummary';

interface FlightDataSummarySectionProps {
  flight: FlightData;
}

export function FlightDataSummarySection({ flight }: FlightDataSummarySectionProps) {
  return <FlightApiDataSummary flight={flight} />;
}
