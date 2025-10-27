import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, MapPin, Calendar, AlertCircle } from 'lucide-react';

interface TrackingEvent {
  date: string;
  description: string;
  location?: string;
}

interface TrackingResult {
  carrier: string;
  trackingNumber: string;
  status: string;
  events: TrackingEvent[];
  error?: string;
}

interface CarrierTrackingResultsProps {
  result: TrackingResult;
}

const getCarrierName = (carrier: string) => {
  const names: Record<string, string> = {
    interrapidisimo: 'Interrapidísimo',
    servientrega: 'Servientrega',
    envia: 'Envía',
    deprisa: 'Deprisa',
    coordinadora: 'Coordinadora'
  };
  return names[carrier] || carrier;
};

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('entregado')) return 'bg-green-500';
  if (statusLower.includes('tránsito') || statusLower.includes('transito')) return 'bg-blue-500';
  if (statusLower.includes('error')) return 'bg-red-500';
  return 'bg-yellow-500';
};

export function CarrierTrackingResults({ result }: CarrierTrackingResultsProps) {
  if (result.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al consultar la transportadora: {result.error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {getCarrierName(result.carrier)}
            </CardTitle>
            <CardDescription>Guía: {result.trackingNumber}</CardDescription>
          </div>
          <Badge className={getStatusColor(result.status)}>
            {result.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Historial de Eventos</h3>
          {result.events && result.events.length > 0 ? (
            <div className="space-y-3">
              {result.events.map((event, index) => (
                <div 
                  key={index} 
                  className="border-l-2 border-primary pl-4 pb-3 relative"
                >
                  <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </div>
                    <p className="text-sm font-medium">{event.description}</p>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay eventos disponibles</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
