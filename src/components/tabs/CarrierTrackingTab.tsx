import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarrierTrackingForm } from '@/components/carrier-tracking/CarrierTrackingForm';
import { CarrierTrackingResults } from '@/components/carrier-tracking/CarrierTrackingResults';
import { useState } from 'react';

interface TrackingResult {
  carrier: string;
  trackingNumber: string;
  status: string;
  events: Array<{
    date: string;
    description: string;
    location?: string;
  }>;
  error?: string;
}

export function CarrierTrackingTab() {
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Rastreo de Transportadoras</CardTitle>
          <CardDescription>
            Consulta el estado de guías enviadas por tus clientes a través de transportadoras colombianas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CarrierTrackingForm 
            onResult={setTrackingResult}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </CardContent>
      </Card>

      {trackingResult && (
        <CarrierTrackingResults result={trackingResult} />
      )}
    </div>
  );
}
