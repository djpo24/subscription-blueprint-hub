
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTrips } from '@/hooks/useTrips';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Calendar, Users } from 'lucide-react';

export function CampaignNotificationsPanel() {
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [outboundTripId, setOutboundTripId] = useState('');
  const [returnTripId, setReturnTripId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { data: trips = [] } = useTrips();
  const { toast } = useToast();

  const messageTemplate = `¡Hola {{nombre_cliente}}! 👋

🛫 **IMPORTANTE: Próximo viaje programado**

Te informamos que tenemos un viaje programado próximamente:

📅 **Salida desde Barranquilla:** {{fecha_salida_baq}}
📅 **Retorno desde Curazao:** {{fecha_retorno_cur}}

⏰ **FECHA LÍMITE para entrega de encomiendas:**
🗓️ **{{fecha_limite_entrega}} antes de las 3:00 PM**

📦 Si tienes alguna encomienda para enviar, por favor asegúrate de entregarla antes de la fecha límite.

📞 Para coordinar la entrega o resolver dudas, contáctanos.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

  const formatDateSpanish = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName} ${day} de ${monthName}`;
  };

  const getDeadlineDate = (outboundDate: string) => {
    const date = new Date(outboundDate + 'T00:00:00');
    date.setDate(date.getDate() - 1); // Un día antes
    return formatDateSpanish(date.toISOString().split('T')[0]);
  };

  const generatePersonalizedMessage = () => {
    if (!customerName || !outboundTripId || !returnTripId) return messageTemplate;

    const outboundTrip = trips.find(t => t.id === outboundTripId);
    const returnTrip = trips.find(t => t.id === returnTripId);

    if (!outboundTrip || !returnTrip) return messageTemplate;

    let personalizedMessage = messageTemplate;
    personalizedMessage = personalizedMessage.replace('{{nombre_cliente}}', customerName);
    personalizedMessage = personalizedMessage.replace('{{fecha_salida_baq}}', formatDateSpanish(outboundTrip.trip_date));
    personalizedMessage = personalizedMessage.replace('{{fecha_retorno_cur}}', formatDateSpanish(returnTrip.trip_date));
    personalizedMessage = personalizedMessage.replace('{{fecha_limite_entrega}}', getDeadlineDate(outboundTrip.trip_date));

    return personalizedMessage;
  };

  const handleSendNotification = async () => {
    if (!phone.trim() || !customerName.trim() || !outboundTripId || !returnTripId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('📤 Enviando notificación de campaña...');

      // Crear entrada de log de notificación
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          notification_type: 'campaign_notification',
          message: generatePersonalizedMessage(),
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creating notification log:', logError);
        throw new Error('Error al crear registro de notificación');
      }

      // Enviar mensaje usando la plantilla proximos_viajes
      const outboundTrip = trips.find(t => t.id === outboundTripId);
      const returnTrip = trips.find(t => t.id === returnTripId);

      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: phone,
          message: generatePersonalizedMessage(),
          useTemplate: true,
          templateName: 'proximos_viajes',
          templateLanguage: 'es_CO',
          customerId: null,
          templateParameters: {
            customerName: customerName,
            outboundDate: outboundTrip?.trip_date || '',
            returnDate: returnTrip?.trip_date || '',
            deadlineDate: outboundTrip ? getDeadlineDate(outboundTrip.trip_date) : ''
          }
        }
      });

      if (functionError) {
        console.error('❌ WhatsApp function error:', functionError);
        throw new Error('Error al enviar mensaje: ' + functionError.message);
      }

      if (responseData && responseData.error) {
        console.error('❌ WhatsApp API error:', responseData.error);
        throw new Error('Error de WhatsApp: ' + responseData.error);
      }

      console.log('✅ Notificación de campaña enviada exitosamente:', responseData);

      toast({
        title: "✅ Notificación enviada",
        description: `Mensaje enviado a ${phone} usando plantilla proximos_viajes`,
      });

      // Limpiar formulario
      setPhone('');
      setCustomerName('');
      setOutboundTripId('');
      setReturnTripId('');

    } catch (error: any) {
      console.error('❌ Error en notificación de campaña:', error);
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo enviar la notificación",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Filtrar viajes por origen
  const outboundTrips = trips.filter(trip => 
    trip.origin?.toLowerCase().includes('barranquilla') || 
    trip.origin?.toLowerCase().includes('baq')
  );

  const returnTrips = trips.filter(trip => 
    trip.origin?.toLowerCase().includes('curazao') || 
    trip.origin?.toLowerCase().includes('cur')
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Notificaciones de Campaña
          </CardTitle>
          <CardDescription>
            Envía notificaciones personalizadas sobre próximos viajes programados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+573001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-name">Nombre del Cliente</Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="Nombre completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outbound-trip">Viaje Salida (Barranquilla → Curazao)</Label>
              <Select value={outboundTripId} onValueChange={setOutboundTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de salida" />
                </SelectTrigger>
                <SelectContent>
                  {outboundTrips.map(trip => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {formatDateSpanish(trip.trip_date)} - {trip.origin} → {trip.destination}
                      {trip.flight_number && ` (${trip.flight_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-trip">Viaje Retorno (Curazao → Barranquilla)</Label>
              <Select value={returnTripId} onValueChange={setReturnTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar viaje de retorno" />
                </SelectTrigger>
                <SelectContent>
                  {returnTrips.map(trip => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {formatDateSpanish(trip.trip_date)} - {trip.origin} → {trip.destination}
                      {trip.flight_number && ` (${trip.flight_number})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vista Previa del Mensaje</Label>
            <Textarea
              value={generatePersonalizedMessage()}
              rows={15}
              className="text-sm bg-gray-50"
              readOnly
            />
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={isSending || !phone.trim() || !customerName.trim() || !outboundTripId || !returnTripId}
            className="w-full flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? 'Enviando...' : 'Enviar Notificación de Campaña'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
