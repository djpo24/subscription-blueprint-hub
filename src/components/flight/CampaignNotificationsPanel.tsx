import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Send, Eye, Users, MessageSquare, TestTube, Package, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useTrips } from '@/hooks/useTrips';
import { formatDateDisplay } from '@/utils/dateUtils';
import { TripNotificationTestDialog } from '@/components/marketing/TripNotificationTestDialog';

const CAMPAIGN_TEMPLATE = `¡Hola {{nombre_cliente}}! 👋

🛫 **IMPORTANTE: Próximo viaje programado**

Te informamos que tenemos un viaje programado próximamente:

📅 **Salida desde Barranquilla:** {{fecha_salida_baq}}
📅 **Retorno desde Curazao:** {{fecha_retorno_cur}}

⏰ **FECHA LÍMITE para entrega de encomiendas:**
🗓️ **{{fecha_limite_entrega}} antes de las 3:00 PM**

📦 Si tienes alguna encomienda para enviar, por favor asegúrate de entregarla antes de la fecha límite.

📞 Para coordinar la entrega o resolver dudas, contáctanos.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

interface PreparedMessage {
  customer: any;
  message: string;
}

export function CampaignNotificationsPanel() {
  const [template, setTemplate] = useState(CAMPAIGN_TEMPLATE);
  const [selectedTemplate, setSelectedTemplate] = useState('proximos_viajes');
  const [selectedOutboundTrip, setSelectedOutboundTrip] = useState('');
  const [selectedReturnTrip, setSelectedReturnTrip] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loadedCustomers, setLoadedCustomers] = useState<any[]>([]);
  const [preparedMessages, setPreparedMessages] = useState<PreparedMessage[]>([]);
  const [availableOutboundTrips, setAvailableOutboundTrips] = useState<any[]>([]);
  const [availableReturnTrips, setAvailableReturnTrips] = useState<any[]>([]);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { data: customers, isLoading: loadingCustomers } = useCustomerData();
  const { data: trips = [], isLoading: loadingTrips } = useTrips();

  useEffect(() => {
    if (trips && trips.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const outboundTrips = trips.filter(trip => {
        const tripDate = new Date(trip.trip_date);
        tripDate.setHours(0, 0, 0, 0);
        
        return (
          trip.origin && 
          trip.origin.toLowerCase().includes('barranquilla') &&
          tripDate >= today &&
          (trip.status === 'scheduled' || trip.status === 'pending')
        );
      }).sort((a, b) => new Date(a.trip_date).getTime() - new Date(b.trip_date).getTime());
      
      setAvailableOutboundTrips(outboundTrips);
    }
  }, [trips]);

  useEffect(() => {
    if (trips && trips.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const returnTrips = trips.filter(trip => {
        const tripDate = new Date(trip.trip_date);
        tripDate.setHours(0, 0, 0, 0);
        
        return (
          trip.origin && 
          trip.origin.toLowerCase().includes('curazao') &&
          tripDate >= today &&
          (trip.status === 'scheduled' || trip.status === 'pending')
        );
      }).sort((a, b) => new Date(a.trip_date).getTime() - new Date(b.trip_date).getTime());
      
      setAvailableReturnTrips(returnTrips);
    }
  }, [trips]);

  const generatePersonalizedMessage = (customer: any) => {
    const selectedOutboundTripDetails = availableOutboundTrips.find(trip => trip.id === selectedOutboundTrip);
    const selectedReturnTripDetails = availableReturnTrips.find(trip => trip.id === selectedReturnTrip);
    
    const outboundDateForMessage = selectedOutboundTripDetails 
      ? formatDateDisplay(selectedOutboundTripDetails.trip_date, 'EEEE, dd \'de\' MMMM \'de\' yyyy')
      : '[fecha_salida_baq]';
      
    const returnDateForMessage = selectedReturnTripDetails 
      ? formatDateDisplay(selectedReturnTripDetails.trip_date, 'EEEE, dd \'de\' MMMM \'de\' yyyy')
      : '[fecha_retorno_cur]';

    const formattedDeadlineDate = deadlineDate 
      ? formatDateDisplay(deadlineDate, 'EEEE, dd \'de\' MMMM \'de\' yyyy')
      : '[fecha_limite_entrega]';

    return template
      .replace(/{{nombre_cliente}}/g, customer.name || 'Cliente')
      .replace(/{{fecha_salida_baq}}/g, outboundDateForMessage)
      .replace(/{{fecha_retorno_cur}}/g, returnDateForMessage)
      .replace(/{{fecha_limite_entrega}}/g, formattedDeadlineDate);
  };

  const handleLoadMessages = () => {
    if (!customers || customers.length === 0) {
      toast({
        title: "Sin clientes",
        description: "No se encontraron clientes registrados en el sistema",
        variant: "destructive"
      });
      return;
    }

    if (!selectedOutboundTrip || !selectedReturnTrip || !deadlineDate) {
      toast({
        title: "Error",
        description: "Por favor completa todas las fechas antes de cargar los mensajes",
        variant: "destructive"
      });
      return;
    }

    const generatedMessages: PreparedMessage[] = customers.map(customer => ({
      customer,
      message: generatePersonalizedMessage(customer)
    }));

    setLoadedCustomers(customers);
    setPreparedMessages(generatedMessages);
    
    toast({
      title: "Mensajes cargados",
      description: `Se prepararon mensajes personalizados para ${customers.length} clientes`,
    });
  };

  const handleClearMessages = () => {
    setLoadedCustomers([]);
    setPreparedMessages([]);
    toast({
      title: "Mensajes limpiados",
      description: "Se han eliminado todos los mensajes preparados",
    });
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  const handleSendCampaign = () => {
    if (!selectedOutboundTrip || !selectedReturnTrip || !deadlineDate) {
      toast({
        title: "Error",
        description: "Por favor completa todas las fechas antes de enviar la campaña",
        variant: "destructive"
      });
      return;
    }

    if (loadedCustomers.length === 0) {
      toast({
        title: "Error",
        description: "Debes cargar los mensajes antes de enviar la campaña",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Campaña enviada",
      description: `La campaña de notificación ha sido enviada a ${loadedCustomers.length} clientes`,
    });
  };

  const selectedOutboundTripDetails = availableOutboundTrips.find(trip => trip.id === selectedOutboundTrip);
  const selectedReturnTripDetails = availableReturnTrips.find(trip => trip.id === selectedReturnTrip);
  
  const outboundDateForPreview = selectedOutboundTripDetails 
    ? formatDateDisplay(selectedOutboundTripDetails.trip_date, 'EEEE, dd \'de\' MMMM \'de\' yyyy')
    : '[fecha_salida_baq]';
    
  const returnDateForPreview = selectedReturnTripDetails 
    ? formatDateDisplay(selectedReturnTripDetails.trip_date, 'EEEE, dd \'de\' MMMM \'de\' yyyy')
    : '[fecha_retorno_cur]';

  const previewTemplate = template
    .replace(/{{nombre_cliente}}/g, 'Juan Pérez')
    .replace(/{{fecha_salida_baq}}/g, outboundDateForPreview)
    .replace(/{{fecha_retorno_cur}}/g, returnDateForPreview)
    .replace(/{{fecha_limite_entrega}}/g, deadlineDate || '[fecha_limite_entrega]');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaña de Notificaciones
          </CardTitle>
          <CardDescription>
            Envía notificaciones masivas sobre próximos viajes a todos los clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outbound-trip">Salida desde Barranquilla</Label>
              <Select value={selectedOutboundTrip} onValueChange={setSelectedOutboundTrip}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTrips ? "Cargando viajes..." : "Selecciona un viaje"} />
                </SelectTrigger>
                <SelectContent>
                  {availableOutboundTrips.length === 0 ? (
                    <SelectItem value="no-trips" disabled>
                      No hay viajes disponibles desde Barranquilla
                    </SelectItem>
                  ) : (
                    availableOutboundTrips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {formatDateDisplay(trip.trip_date, 'dd/MM/yyyy')} - {trip.destination || 'Sin destino'}
                        {trip.flight_number && ` (${trip.flight_number})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="return-trip">Retorno desde Curazao</Label>
              <Select value={selectedReturnTrip} onValueChange={setSelectedReturnTrip}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTrips ? "Cargando viajes..." : "Selecciona un viaje"} />
                </SelectTrigger>
                <SelectContent>
                  {availableReturnTrips.length === 0 ? (
                    <SelectItem value="no-trips" disabled>
                      No hay viajes disponibles desde Curazao
                    </SelectItem>
                  ) : (
                    availableReturnTrips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {formatDateDisplay(trip.trip_date, 'dd/MM/yyyy')} - {trip.destination || 'Sin destino'}
                        {trip.flight_number && ` (${trip.flight_number})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-date">Fecha Límite Entrega</Label>
              <Input
                id="deadline-date"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-select">Plantilla de WhatsApp</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proximos_viajes">Próximos Viajes</SelectItem>
                <SelectItem value="urgente_viaje">Viaje Urgente</SelectItem>
                <SelectItem value="recordatorio">Recordatorio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLoadMessages}
                disabled={loadingCustomers}
                className="flex items-center gap-2"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4" />
                {loadingCustomers ? 'Cargando...' : 'Cargar Mensajes'}
              </Button>
              {loadedCustomers.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Users className="h-4 w-4" />
                  <span>{loadedCustomers.length} mensajes preparados</span>
                </div>
              )}
            </div>
            {preparedMessages.length > 0 && (
              <Button
                onClick={handleClearMessages}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Mensajes
              </Button>
            )}
          </div>

          {preparedMessages.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Package className="h-5 w-5" />
                  Mensajes Preparados para Envío
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {preparedMessages.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-green-600">
                  Mensajes personalizados listos para ser enviados via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {preparedMessages.map((item, index) => (
                    <div
                      key={item.customer.id || index}
                      className="p-4 bg-white rounded border border-green-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">
                              {item.customer.name || 'Cliente'}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {item.customer.whatsapp_number || item.customer.phone}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-green-600">
                          Listo
                        </Badge>
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs border">
                        <strong>Mensaje personalizado:</strong>
                        <div className="mt-2 text-gray-700 whitespace-pre-line">
                          {item.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template">Mensaje de la Plantilla</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreview ? 'Editar' : 'Vista Previa'}
              </Button>
            </div>
            {isPreview ? (
              <div className="p-4 bg-muted rounded-md border">
                <p className="text-sm font-medium mb-2">Vista previa:</p>
                <div className="whitespace-pre-wrap text-sm">
                  {previewTemplate}
                </div>
              </div>
            ) : (
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={15}
                placeholder="Escribe tu mensaje aquí..."
                className="font-mono text-sm"
              />
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Variables disponibles:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><code>{"{{nombre_cliente}}"}</code> - Nombre del cliente</p>
              <p><code>{"{{fecha_salida_baq}}"}</code> - Fecha de salida desde Barranquilla</p>
              <p><code>{"{{fecha_retorno_cur}}"}</code> - Fecha de retorno desde Curazao</p>
              <p><code>{"{{fecha_limite_entrega}}"}</code> - Fecha límite para entrega</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {loadedCustomers.length > 0 
                  ? `Enviará a ${loadedCustomers.length} clientes cargados`
                  : 'Primero carga los mensajes con "Cargar Mensajes"'
                }
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsTestDialogOpen(true)} 
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Prueba
              </Button>
              <Button onClick={handleSendCampaign} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Enviar Campaña
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TripNotificationTestDialog 
        isOpen={isTestDialogOpen}
        onOpenChange={setIsTestDialogOpen}
      />
    </div>
  );
}
