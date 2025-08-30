
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCampaignNotifications } from '@/hooks/useCampaignNotifications';
import { formatDateDisplay } from '@/utils/dateUtils';
import { Calendar, AlertCircle } from 'lucide-react';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number?: string;
  status: string;
}

interface CreateCampaignNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trips: Trip[];
}

export function CreateCampaignNotificationDialog({
  isOpen,
  onOpenChange,
  trips
}: CreateCampaignNotificationDialogProps) {
  const [campaignName, setCampaignName] = useState('');
  const [outboundTripId, setOutboundTripId] = useState('');
  const [returnTripId, setReturnTripId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');

  const { createNotification, isCreating } = useCampaignNotifications();

  // Filtrar viajes por origen
  const barranquillaTrips = trips.filter(trip => 
    trip.origin?.toLowerCase().includes('barranquilla') && 
    (trip.status === 'scheduled' || trip.status === 'pending')
  );
  
  const curazaoTrips = trips.filter(trip => 
    trip.origin?.toLowerCase().includes('curazao') && 
    (trip.status === 'scheduled' || trip.status === 'pending')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignName || !outboundTripId || !returnTripId) {
      return;
    }

    createNotification({
      campaign_name: campaignName,
      outbound_trip_id: outboundTripId,
      return_trip_id: returnTripId,
      deadline_date: deadlineDate || undefined
    });

    // Reset form
    setCampaignName('');
    setOutboundTripId('');
    setReturnTripId('');
    setDeadlineDate('');
    onOpenChange(false);
  };

  const selectedOutboundTrip = trips.find(t => t.id === outboundTripId);
  const selectedReturnTrip = trips.find(t => t.id === returnTripId);

  // Calcular fecha límite automáticamente (un día antes de la salida)
  const calculateDeadlineDate = (tripDate: string) => {
    const date = new Date(tripDate);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Campaña de Próximos Viajes</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Nombre de la Campaña</Label>
            <Input
              id="campaign-name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Ej: Campaña Enero 2025"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Viaje de Salida (Barranquilla)</Label>
              <Select value={outboundTripId} onValueChange={setOutboundTripId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de salida" />
                </SelectTrigger>
                <SelectContent>
                  {barranquillaTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {formatDateDisplay(trip.trip_date, 'dd/MM/yyyy')} - {trip.origin} → {trip.destination}
                      {trip.flight_number && ` (${trip.flight_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Viaje de Retorno (Curazao)</Label>
              <Select value={returnTripId} onValueChange={setReturnTripId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de retorno" />
                </SelectTrigger>
                <SelectContent>
                  {curazaoTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {formatDateDisplay(trip.trip_date, 'dd/MM/yyyy')} - {trip.origin} → {trip.destination}
                      {trip.flight_number && ` (${trip.flight_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline-date">Fecha Límite de Entrega</Label>
            <Input
              id="deadline-date"
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
            />
            {selectedOutboundTrip && (
              <p className="text-sm text-gray-500">
                Sugerencia: {calculateDeadlineDate(selectedOutboundTrip.trip_date)} (un día antes de la salida)
              </p>
            )}
          </div>

          {(barranquillaTrips.length === 0 || curazaoTrips.length === 0) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {barranquillaTrips.length === 0 && "No hay viajes programados desde Barranquilla. "}
                {curazaoTrips.length === 0 && "No hay viajes programados desde Curazao. "}
                Asegúrate de tener viajes programados en ambas direcciones.
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <strong>Plantilla del mensaje:</strong> Se usará la plantilla "proximos_viajes" con los parámetros configurados automáticamente.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !campaignName || !outboundTripId || !returnTripId}
            >
              {isCreating ? 'Creando...' : 'Crear Campaña'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
