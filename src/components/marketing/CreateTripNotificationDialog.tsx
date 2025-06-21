
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTripNotifications } from '@/hooks/useTripNotifications';
import { formatDispatchDate } from '@/utils/dateUtils';
import { Calendar, Plane, Clock } from 'lucide-react';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
}

interface CreateTripNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trips: Trip[];
}

const DEFAULT_TEMPLATE = `¡Hola {{nombre_cliente}}! 👋

🛫 **IMPORTANTE: Próximo viaje programado**

Te informamos que tenemos un viaje programado próximamente:

📅 **Salida desde Barranquilla:** {{fecha_salida_baq}}
📅 **Retorno desde Curazao:** {{fecha_retorno_cur}}

⏰ **FECHA LÍMITE para entrega de encomiendas:**
🗓️ **{{fecha_limite_entrega}} antes de las 3:00 PM**

📦 Si tienes alguna encomienda para enviar, por favor asegúrate de entregarla antes de la fecha límite.

📞 Para coordinar la entrega o resolver dudas, contáctanos.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

export function CreateTripNotificationDialog({ 
  isOpen, 
  onOpenChange, 
  trips 
}: CreateTripNotificationDialogProps) {
  const [outboundTripId, setOutboundTripId] = useState<string>('');
  const [returnTripId, setReturnTripId] = useState<string>('');
  const [deadlineDate, setDeadlineDate] = useState<string>('');
  const [deadlineTime, setDeadlineTime] = useState<string>('15:00');
  const [messageTemplate, setMessageTemplate] = useState<string>(DEFAULT_TEMPLATE);
  
  const { createNotification, isCreating } = useTripNotifications();

  // Filter trips for outbound (Barranquilla -> Curazao) and return (Curazao -> Barranquilla)
  const outboundTrips = trips.filter(trip => 
    trip.origin.toLowerCase().includes('barranquilla') && 
    trip.destination.toLowerCase().includes('curazao') &&
    trip.status === 'scheduled'
  );

  const returnTrips = trips.filter(trip => 
    trip.origin.toLowerCase().includes('curazao') && 
    trip.destination.toLowerCase().includes('barranquilla') &&
    trip.status === 'scheduled'
  );

  // Calculate deadline date when outbound trip is selected
  useEffect(() => {
    if (outboundTripId) {
      const selectedTrip = outboundTrips.find(trip => trip.id === outboundTripId);
      if (selectedTrip) {
        const tripDate = new Date(selectedTrip.trip_date + 'T00:00:00');
        tripDate.setDate(tripDate.getDate() - 1); // One day before
        setDeadlineDate(tripDate.toISOString().split('T')[0]);
      }
    }
  }, [outboundTripId, outboundTrips]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!outboundTripId || !returnTripId || !deadlineDate) {
      return;
    }

    try {
      await createNotification({
        outbound_trip_id: outboundTripId,
        return_trip_id: returnTripId,
        deadline_date: deadlineDate,
        deadline_time: deadlineTime,
        message_template: messageTemplate,
        created_by: null // Will be set by RLS
      });
      
      // Reset form
      setOutboundTripId('');
      setReturnTripId('');
      setDeadlineDate('');
      setDeadlineTime('15:00');
      setMessageTemplate(DEFAULT_TEMPLATE);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const formatTripDisplay = (trip: Trip) => {
    // Usar formatDispatchDate para evitar problemas de zona horaria
    const formattedDate = formatDispatchDate(trip.trip_date);
    
    // Obtener el día de la semana manualmente sin conversión de zona horaria
    const dateParts = trip.trip_date.split('-');
    const tripDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const weekday = tripDate.toLocaleDateString('es-ES', { weekday: 'long' });
    
    return `${weekday}, ${formattedDate} - ${trip.origin} → ${trip.destination}${trip.flight_number ? ` (${trip.flight_number})` : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Nueva Notificación de Viaje
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Outbound Trip Selection */}
            <div className="space-y-2">
              <Label htmlFor="outbound-trip" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Viaje de Ida (Barranquilla → Curazao)
              </Label>
              <Select value={outboundTripId} onValueChange={setOutboundTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de ida" />
                </SelectTrigger>
                <SelectContent>
                  {outboundTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {formatTripDisplay(trip)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {outboundTrips.length === 0 && (
                <p className="text-sm text-red-500">No hay viajes de ida disponibles</p>
              )}
            </div>

            {/* Return Trip Selection */}
            <div className="space-y-2">
              <Label htmlFor="return-trip" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Viaje de Retorno (Curazao → Barranquilla)
              </Label>
              <Select value={returnTripId} onValueChange={setReturnTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de retorno" />
                </SelectTrigger>
                <SelectContent>
                  {returnTrips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {formatTripDisplay(trip)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {returnTrips.length === 0 && (
                <p className="text-sm text-red-500">No hay viajes de retorno disponibles</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deadline Date */}
            <div className="space-y-2">
              <Label htmlFor="deadline-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha Límite de Entrega
              </Label>
              <Input
                id="deadline-date"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                Por defecto: un día antes del viaje de ida
              </p>
            </div>

            {/* Deadline Time */}
            <div className="space-y-2">
              <Label htmlFor="deadline-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora Límite
              </Label>
              <Input
                id="deadline-time"
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                required
              />
              <p className="text-sm text-gray-500">
                Hora límite para entregar encomiendas
              </p>
            </div>
          </div>

          {/* Message Template */}
          <div className="space-y-2">
            <Label htmlFor="message-template">
              Plantilla del Mensaje
            </Label>
            <Textarea
              id="message-template"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Escribe la plantilla del mensaje..."
              required
            />
            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Variables disponibles:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>{'{{nombre_cliente}}'}</code> - Nombre del cliente</li>
                <li><code>{'{{fecha_salida_baq}}'}</code> - Fecha del viaje de ida</li>
                <li><code>{'{{fecha_retorno_cur}}'}</code> - Fecha del viaje de retorno</li>
                <li><code>{'{{fecha_limite_entrega}}'}</code> - Fecha límite de entrega</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !outboundTripId || !returnTripId}
            >
              {isCreating ? 'Creando...' : 'Crear Notificación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
