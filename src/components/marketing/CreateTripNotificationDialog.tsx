
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTripNotifications } from '@/hooks/useTripNotifications';
import { formatTripDate } from '@/utils/dateUtils';
import { Plane, Calendar, Clock, MessageSquare } from 'lucide-react';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number?: string;
}

interface CreateTripNotificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trips: Trip[];
}

export function CreateTripNotificationDialog({ 
  isOpen, 
  onOpenChange, 
  trips 
}: CreateTripNotificationDialogProps) {
  const { createNotification, isCreating } = useTripNotifications();
  
  const [outboundTripId, setOutboundTripId] = useState('');
  const [returnTripId, setReturnTripId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('15:00');
  const [messageTemplate, setMessageTemplate] = useState(
    'Hola {{nombre_cliente}}! 📅 Te recordamos nuestros próximos viajes:\n\n' +
    '✈️ Salida desde Barranquilla: {{fecha_salida_baq}}\n' +
    '🔄 Retorno desde Curazao: {{fecha_retorno_cur}}\n' +
    '⏰ Fecha límite para entrega: {{fecha_limite_entrega}}\n\n' +
    '¡Reserva tu espacio ahora! 📦'
  );
  const [templateName, setTemplateName] = useState('proximos_viajes');
  const [templateLanguage, setTemplateLanguage] = useState('es_CO');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createNotification({
        outbound_trip_id: outboundTripId,
        return_trip_id: returnTripId,
        deadline_date: deadlineDate,
        deadline_time: deadlineTime,
        message_template: messageTemplate,
        template_name: templateName,
        template_language: templateLanguage,
        created_by: null
      });
      
      // Reset form
      setOutboundTripId('');
      setReturnTripId('');
      setDeadlineDate('');
      setDeadlineTime('15:00');
      setMessageTemplate(
        'Hola {{nombre_cliente}}! 📅 Te recordamos nuestros próximos viajes:\n\n' +
        '✈️ Salida desde Barranquilla: {{fecha_salida_baq}}\n' +
        '🔄 Retorno desde Curazao: {{fecha_retorno_cur}}\n' +
        '⏰ Fecha límite para entrega: {{fecha_limite_entrega}}\n\n' +
        '¡Reserva tu espacio ahora! 📦'
      );
      setTemplateName('proximos_viajes');
      setTemplateLanguage('es_CO');
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating trip notification:', error);
    }
  };

  const formatTripOption = (trip: Trip) => {
    // CORRECCIÓN: Usar formatTripDate para evitar desfases de un día
    const date = formatTripDate(trip.trip_date);
    const flight = trip.flight_number ? ` (${trip.flight_number})` : '';
    return `${date} - ${trip.origin} → ${trip.destination}${flight}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Nueva Notificación de Viajes
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outbound-trip" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Viaje de Ida (Barranquilla → Curazao)
              </Label>
              <Select value={outboundTripId} onValueChange={setOutboundTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de ida" />
                </SelectTrigger>
                <SelectContent>
                  {trips
                    .filter(trip => trip.origin.includes('Barranquilla') || trip.origin.includes('BAQ'))
                    .map(trip => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {formatTripOption(trip)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-trip" className="flex items-center gap-2">
                <Plane className="h-4 w-4 rotate-180" />
                Viaje de Retorno (Curazao → Barranquilla)
              </Label>
              <Select value={returnTripId} onValueChange={setReturnTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de retorno" />
                </SelectTrigger>
                <SelectContent>
                  {trips
                    .filter(trip => trip.origin.includes('Curazao') || trip.origin.includes('CUR'))
                    .map(trip => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {formatTripOption(trip)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

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
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-blue-50">
            <Label className="text-sm font-medium text-blue-800">
              Configuración de Plantilla WhatsApp
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nombre de Plantilla</Label>
                <Select value={templateName} onValueChange={setTemplateName}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proximos_viajes">proximos_viajes</SelectItem>
                    <SelectItem value="customer_service_hello">customer_service_hello</SelectItem>
                    <SelectItem value="customer_service_followup">customer_service_followup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-language">Idioma</Label>
                <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es_CO">Español (Colombia)</SelectItem>
                    <SelectItem value="en_US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message-template">Mensaje Personalizado</Label>
            <Textarea
              id="message-template"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={8}
              placeholder="Escriba su mensaje aquí..."
              className="text-sm"
            />
            <div className="text-xs text-gray-500 mt-2">
              <p><strong>Variables disponibles:</strong></p>
              <ul className="list-disc list-inside mt-1">
                <li><code>{'{{nombre_cliente}}'}</code> - Nombre del cliente</li>
                <li><code>{'{{fecha_salida_baq}}'}</code> - Fecha de salida desde Barranquilla</li>
                <li><code>{'{{fecha_retorno_cur}}'}</code> - Fecha de retorno desde Curazao</li>
                <li><code>{'{{fecha_limite_entrega}}'}</code> - Fecha límite de entrega</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
            >
              {isCreating ? 'Creando...' : 'Crear Notificación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
