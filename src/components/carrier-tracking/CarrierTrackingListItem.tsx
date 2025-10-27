import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, User, Package, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TrackingGuide {
  id: string;
  customer_id: string;
  carrier: string;
  tracking_number: string;
  status: string;
  last_status: string;
  last_check_at: string;
  delivered_at: string;
  created_at: string;
  last_tracking_data: any;
  notes: string;
  customers: {
    name: string;
    phone: string;
  };
}

interface CarrierTrackingListItemProps {
  guide: TrackingGuide;
  onRefresh: () => void;
  isDelivered?: boolean;
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
  const statusLower = status?.toLowerCase() || '';
  if (statusLower.includes('entregado')) return 'bg-green-500';
  if (statusLower.includes('tránsito') || statusLower.includes('transito')) return 'bg-blue-500';
  if (statusLower.includes('error')) return 'bg-red-500';
  return 'bg-yellow-500';
};

export function CarrierTrackingListItem({ guide, onRefresh, isDelivered }: CarrierTrackingListItemProps) {
  const lastCheckText = guide.last_check_at
    ? formatDistanceToNow(new Date(guide.last_check_at), { addSuffix: true, locale: es })
    : 'Nunca';

  const deliveredText = guide.delivered_at
    ? formatDistanceToNow(new Date(guide.delivered_at), { addSuffix: true, locale: es })
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-4 w-4" />
              {getCarrierName(guide.carrier)}
            </CardTitle>
            <CardDescription>Guía: {guide.tracking_number}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {guide.last_status && (
              <Badge className={getStatusColor(guide.last_status)}>
                {guide.last_status}
              </Badge>
            )}
            {!isDelivered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{guide.customers?.name}</span>
          </div>
          
          {isDelivered && deliveredText ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>Entregado {deliveredText}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Última consulta: {lastCheckText}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Creado {formatDistanceToNow(new Date(guide.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>

          {guide.notes && (
            <div className="mt-2 p-2 bg-muted rounded-md text-xs">
              {guide.notes}
            </div>
          )}

          {guide.last_tracking_data?.events && guide.last_tracking_data.events.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-semibold mb-2">Último evento:</p>
              <div className="text-xs text-muted-foreground">
                {guide.last_tracking_data.events[0].description}
                {guide.last_tracking_data.events[0].location && (
                  <span className="ml-2">• {guide.last_tracking_data.events[0].location}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
