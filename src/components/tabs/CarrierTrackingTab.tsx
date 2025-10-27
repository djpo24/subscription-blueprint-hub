import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarrierTrackingForm } from '@/components/carrier-tracking/CarrierTrackingForm';
import { CarrierTrackingResults } from '@/components/carrier-tracking/CarrierTrackingResults';
import { CarrierTrackingList } from '@/components/carrier-tracking/CarrierTrackingList';
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
            Agrega guías para seguimiento automático cada 3 horas
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

      <CarrierTrackingList />
    </div>
  );
}
