import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Megaphone, Send, Eye, Users, MessageSquare, TestTube, Package, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useTrips } from '@/hooks/useTrips';
import { useCleanTestContacts } from '@/hooks/useCleanTestContacts';
import { formatDateDisplay } from '@/utils/dateUtils';
import { TripNotificationTestDialog } from '@/components/marketing/TripNotificationTestDialog';
import { supabase } from '@/integrations/supabase/client';

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

interface SendingStatus {
  customerId: string;
  customerName: string;
  phone: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  error?: string;
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

  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [sendingStatus, setSendingStatus] = useState<SendingStatus[]>([]);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  
  const { toast } = useToast();
  const { data: customers, isLoading: loadingCustomers } = useCustomerData();
  const { data: trips = [], isLoading: loadingTrips } = useTrips();
  const cleanTestContacts = useCleanTestContacts();

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

    // Verificar si hay contactos válidos (sin contactos de prueba)
    const validCustomers = customers.filter(customer => {
      const hasValidPhone = customer.whatsapp_number || customer.phone;
      const isNotTestUser = !customer.name?.includes('TEST_USER_DO_NOT_SAVE') && 
                           customer.phone !== '0000000000' && 
                           customer.whatsapp_number !== '0000000000' &&
                           customer.phone !== '0' &&
                           customer.whatsapp_number !== '0';
      return hasValidPhone && isNotTestUser;
    });

    if (validCustomers.length === 0) {
      toast({
        title: "Sin clientes válidos",
        description: "No se encontraron clientes con números de teléfono válidos",
        variant: "destructive"
      });
      return;
    }

    const generatedMessages: PreparedMessage[] = validCustomers.map(customer => ({
      customer,
      message: generatePersonalizedMessage(customer)
    }));

    setLoadedCustomers(validCustomers);
    setPreparedMessages(generatedMessages);
    
    toast({
      title: "Mensajes cargados",
      description: `Se prepararon mensajes personalizados para ${validCustomers.length} clientes válidos`,
    });
  };

  const handleCleanTestContacts = () => {
    cleanTestContacts.mutate();
  };

  const handleClearMessages = () => {
    setLoadedCustomers([]);
    setPreparedMessages([]);
    setSendingStatus([]);
    setSentCount(0);
    setFailedCount(0);
    toast({
      title: "Mensajes limpiados",
      description: "Se han eliminado todos los mensajes preparados",
    });
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  const handleSendCampaign = async () => {
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

    setIsSendingCampaign(true);
    setSentCount(0);
    setFailedCount(0);

    const initialStatus: SendingStatus[] = loadedCustomers.map(customer => ({
      customerId: customer.id,
      customerName: customer.name || 'Cliente',
      phone: customer.whatsapp_number || customer.phone,
      status: 'pending'
    }));

    setSendingStatus(initialStatus);

    console.log('🚀 Iniciando envío de campaña a', loadedCustomers.length, 'clientes');

    const selectedOutboundTripDetails = availableOutboundTrips.find(trip => trip.id === selectedOutboundTrip);
    const selectedReturnTripDetails = availableReturnTrips.find(trip => trip.id === selectedReturnTrip);

    for (let i = 0; i < preparedMessages.length; i++) {
      const messageData = preparedMessages[i];
      const customer = messageData.customer;
      const phone = customer.whatsapp_number || customer.phone;

      if (!phone) {
        console.warn(`❌ Cliente ${customer.name} sin número de teléfono válido`);
        setSendingStatus(prev => prev.map(status => 
          status.customerId === customer.id 
            ? { ...status, status: 'failed', error: 'Sin número de teléfono' }
            : status
        ));
        setFailedCount(prev => prev + 1);
        continue;
      }

      setSendingStatus(prev => prev.map(status => 
        status.customerId === customer.id 
          ? { ...status, status: 'sending' }
          : status
      ));

      try {
        console.log(`📱 Enviando mensaje ${i + 1}/${preparedMessages.length} a ${customer.name} (${phone})`);

        // CAMBIO CRÍTICO: Usar notification_log en lugar de trip_notification_log (igual que llegadas)
        const { data: notificationData, error: logError } = await supabase
          .from('notification_log')
          .insert({
            package_id: null,
            customer_id: customer.id,
            notification_type: 'trip_campaign',
            message: messageData.message,
            status: 'pending'
          })
          .select()
          .single();

        if (logError) {
          console.error('❌ Error creating notification log:', logError);
          setSendingStatus(prev => prev.map(status => 
            status.customerId === customer.id 
              ? { ...status, status: 'failed', error: 'Error al crear registro' }
              : status
          ));
          setFailedCount(prev => prev + 1);
          continue;
        }

        // Enviar mensaje por WhatsApp MANUALMENTE - SIN PLANTILLAS
        const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-manual-message', {
          body: {
            notificationId: notificationData.id,
            phone: phone,
            message: messageData.message,
            useTemplate: true,
            templateName: 'proximos_viajes',
            templateLanguage: 'es_CO',
            templateParameters: {
              customerName: customer.name || 'Cliente',
              outboundDate: selectedOutboundTripDetails?.trip_date || '',
              returnDate: selectedReturnTripDetails?.trip_date || '',
              deadlineDate: deadlineDate || ''
            },
            customerId: customer.id
          },
          headers: {
            'X-App-Key': 'manual-send-2024-secure'
          }
        });

        if (whatsappError || (whatsappResponse && whatsappResponse.error)) {
          console.error(`❌ Error enviando WhatsApp a ${customer.name}:`, whatsappError || whatsappResponse.error);
          
          setSendingStatus(prev => prev.map(status => 
            status.customerId === customer.id 
              ? { ...status, status: 'failed', error: whatsappError?.message || whatsappResponse?.error || 'Error de WhatsApp' }
              : status
          ));
          setFailedCount(prev => prev + 1);
          continue;
        }

        setSendingStatus(prev => prev.map(status => 
          status.customerId === customer.id 
            ? { ...status, status: 'sent' }
            : status
        ));
        setSentCount(prev => prev + 1);

        console.log(`✅ Mensaje enviado exitosamente a ${customer.name}`);

      } catch (error: any) {
        console.error(`❌ Error enviando mensaje a ${customer.name}:`, error);
        
        setSendingStatus(prev => prev.map(status => 
          status.customerId === customer.id 
            ? { ...status, status: 'failed', error: error.message || 'Error desconocido' }
            : status
        ));
        setFailedCount(prev => prev + 1);
      }

      // Pausa entre mensajes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsSendingCampaign(false);

    toast({
      title: "Campaña completada",
      description: `Se enviaron ${sentCount} mensajes exitosamente. ${failedCount} fallaron.`,
      variant: sentCount > failedCount ? "default" : "destructive"
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

  const totalMessages = preparedMessages.length;
  const progressPercentage = totalMessages > 0 ? ((sentCount + failedCount) / totalMessages) * 100 : 0;

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
          {/* Botón de limpieza de contactos de prueba */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Limpiar Contactos de Prueba</h4>
                <p className="text-sm text-yellow-700">
                  Elimina contactos de prueba (TEST_USER_DO_NOT_SAVE, números 0000000000) para evitar costos innecesarios
                </p>
              </div>
              <Button
                onClick={handleCleanTestContacts}
                disabled={cleanTestContacts.isPending}
                variant="outline"
                className="flex items-center gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <Trash2 className="h-4 w-4" />
                {cleanTestContacts.isPending ? 'Limpiando...' : 'Limpiar Contactos'}
              </Button>
            </div>
          </div>

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
                disabled={loadingCustomers || isSendingCampaign}
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
            {preparedMessages.length > 0 && !isSendingCampaign && (
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

          {isSendingCampaign && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Clock className="h-5 w-5" />
                  Enviando Campaña
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    {sentCount + failedCount} / {totalMessages}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Enviando mensajes de WhatsApp uno por uno...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {sentCount + failedCount} de {totalMessages}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="w-full" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">{sentCount}</div>
                      <div className="text-sm text-green-600">Enviados</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                      <div className="text-sm text-red-600">Fallaron</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-600">{totalMessages - sentCount - failedCount}</div>
                      <div className="text-sm text-gray-600">Pendientes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {sendingStatus.length > 0 && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <MessageSquare className="h-5 w-5" />
                  Estado de Envío
                  <Badge variant="outline" className="text-gray-600 border-gray-300">
                    {sendingStatus.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sendingStatus.map((status) => (
                    <div
                      key={status.customerId}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {status.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                          {status.status === 'sending' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
                          {status.status === 'sent' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {status.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{status.customerName}</div>
                          <div className="text-xs text-gray-500">{status.phone}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            status.status === 'sent' ? 'default' : 
                            status.status === 'failed' ? 'destructive' : 
                            status.status === 'sending' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {status.status === 'pending' && 'Pendiente'}
                          {status.status === 'sending' && 'Enviando...'}
                          {status.status === 'sent' && 'Enviado'}
                          {status.status === 'failed' && 'Falló'}
                        </Badge>
                        {status.error && (
                          <div className="text-xs text-red-500 mt-1 max-w-32 truncate" title={status.error}>
                            {status.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {preparedMessages.length > 0 && !isSendingCampaign && (
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
                disabled={isSendingCampaign}
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
                disabled={isSendingCampaign}
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
                {isSendingCampaign 
                  ? `Enviando a ${totalMessages} clientes...`
                  : loadedCustomers.length > 0 
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
                disabled={isSendingCampaign}
              >
                <TestTube className="h-4 w-4" />
                Prueba
              </Button>
              <Button 
                onClick={handleSendCampaign} 
                className="flex items-center gap-2"
                disabled={isSendingCampaign || loadedCustomers.length === 0}
              >
                <Send className="h-4 w-4" />
                {isSendingCampaign ? 'Enviando...' : 'Enviar Campaña'}
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
