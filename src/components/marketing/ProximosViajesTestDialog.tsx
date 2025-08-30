
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Send, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProximosViajesTestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProximosViajesTestDialog({ isOpen, onOpenChange }: ProximosViajesTestDialogProps) {
  const [customerName, setCustomerName] = useState('Juan Pérez');
  const [phone, setPhone] = useState('+59995123456');
  const [outboundDate, setOutboundDate] = useState('2025-09-03');
  const [returnDate, setReturnDate] = useState('2025-09-05');
  const [deadlineDate, setDeadlineDate] = useState('2025-09-02');
  const [isTesting, setIsTesting] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [showPayload, setShowPayload] = useState(false);
  
  const { toast } = useToast();

  const formatDateToSpanish = (dateString: string) => {
    if (!dateString) return 'fecha no disponible';
    
    const date = new Date(dateString + 'T00:00:00');
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const monthName = months[date.getMonth()];
    
    return `${dayName} ${dayNumber} de ${monthName}`;
  };

  const generatePreviewPayload = () => {
    const outboundDateText = formatDateToSpanish(outboundDate);
    const returnDateText = formatDateToSpanish(returnDate);
    const deadlineDateText = formatDateToSpanish(deadlineDate);

    return {
      messaging_product: 'whatsapp',
      to: phone.replace(/^\+/, ''), // Remove + for API
      type: 'template',
      template: {
        name: 'proximos_viajes',
        language: {
          code: 'es_CO'
        },
        components: [
          {
            type: 'header',
            parameters: [
              { type: 'text', text: customerName } // {{1}}
            ]
          },
          {
            type: 'body',
            parameters: [
              { type: 'text', text: outboundDateText }, // {{2}}
              { type: 'text', text: returnDateText },   // {{3}}
              { type: 'text', text: deadlineDateText }  // {{4}}
            ]
          }
        ]
      }
    };
  };

  const handleTest = async () => {
    if (!phone || !customerName || !outboundDate || !returnDate || !deadlineDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setLastResponse(null);

    try {
      console.log('🧪 Iniciando test de plantilla proximos_viajes...');
      
      // Crear entrada de notificación de prueba
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          package_id: null,
          customer_id: null,
          notification_type: 'test_proximos_viajes',
          message: `Test plantilla proximos_viajes para ${customerName}`,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creating test notification log:', logError);
        throw new Error('Error al crear registro de prueba');
      }

      // Enviar test usando la función edge
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: phone,
          message: `Test de plantilla proximos_viajes para ${customerName}`,
          useTemplate: true,
          templateName: 'proximos_viajes',
          templateLanguage: 'es_CO',
          templateParameters: {
            customerName: customerName,
            outboundDate: outboundDate,
            returnDate: returnDate,
            deadlineDate: deadlineDate
          },
          customerId: null
        }
      });

      setLastResponse({
        success: !functionError && !responseData?.error,
        data: responseData,
        error: functionError || responseData?.error,
        payload: generatePreviewPayload()
      });

      if (functionError || responseData?.error) {
        console.error('❌ Test error:', functionError || responseData.error);
        toast({
          title: "Error en el test",
          description: functionError?.message || responseData?.error || 'Error desconocido',
          variant: "destructive"
        });
      } else {
        console.log('✅ Test exitoso:', responseData);
        toast({
          title: "Test exitoso",
          description: `Mensaje enviado correctamente a ${phone}`,
        });
      }

    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setLastResponse({
        success: false,
        error: error.message,
        payload: generatePreviewPayload()
      });
      
      toast({
        title: "Error en el test",
        description: error.message || 'Error inesperado durante el test',
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const payload = generatePreviewPayload();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Plantilla Próximos Viajes
          </DialogTitle>
          <DialogDescription>
            Prueba la plantilla "proximos_viajes" con parámetros personalizados y verifica el payload exacto que se envía a WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración de Prueba */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4" />
                  Parámetros de Prueba
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Nombre Cliente</Label>
                    <Input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Juan Pérez"
                    />
                    <Badge variant="outline" className="text-xs">{{1}} Header</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+59995123456"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="outbound-date">Fecha Salida (Barranquilla)</Label>
                    <Input
                      id="outbound-date"
                      type="date"
                      value={outboundDate}
                      onChange={(e) => setOutboundDate(e.target.value)}
                    />
                    <Badge variant="outline" className="text-xs">{{2}} Body - {formatDateToSpanish(outboundDate)}</Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="return-date">Fecha Retorno (Curazao)</Label>
                    <Input
                      id="return-date"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                    <Badge variant="outline" className="text-xs">{{3}} Body - {formatDateToSpanish(returnDate)}</Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline-date">Fecha Límite Entrega</Label>
                    <Input
                      id="deadline-date"
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => setDeadlineDate(e.target.value)}
                    />
                    <Badge variant="outline" className="text-xs">{{4}} Body - {formatDateToSpanish(deadlineDate)}</Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleTest} 
                    disabled={isTesting}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isTesting ? 'Enviando...' : 'Enviar Test'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPayload(!showPayload)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Payload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa y Resultados */}
          <div className="space-y-4">
            {/* Payload Preview */}
            {showPayload && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payload WhatsApp</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Resultado del Test */}
            {lastResponse && (
              <Card className={lastResponse.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CardHeader>
                  <CardTitle className={`text-sm flex items-center gap-2 ${lastResponse.success ? "text-green-800" : "text-red-800"}`}>
                    <Badge variant={lastResponse.success ? "default" : "destructive"}>
                      {lastResponse.success ? "✅ Exitoso" : "❌ Error"}
                    </Badge>
                    Resultado del Test
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lastResponse.success ? (
                    <div className="space-y-2">
                      <p className="text-sm text-green-700">
                        ✅ Mensaje enviado correctamente
                      </p>
                      {lastResponse.data?.whatsappMessageId && (
                        <p className="text-xs text-green-600">
                          ID: {lastResponse.data.whatsappMessageId}
                        </p>
                      )}
                      {lastResponse.data?.templateUsed && (
                        <p className="text-xs text-green-600">
                          Plantilla: {lastResponse.data.templateUsed}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-red-700 font-medium">
                        Error: {lastResponse.error?.message || lastResponse.error || 'Error desconocido'}
                      </p>
                      {lastResponse.data?.error_code && (
                        <p className="text-xs text-red-600">
                          Código: {lastResponse.data.error_code}
                        </p>
                      )}
                      {lastResponse.data?.details && (
                        <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800">
                          {JSON.stringify(lastResponse.data.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Información de la Plantilla */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">Configuración Actual</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-blue-700">
                <div><strong>Plantilla:</strong> proximos_viajes</div>
                <div><strong>Idioma:</strong> es_CO</div>
                <div><strong>Parámetros esperados:</strong></div>
                <ul className="ml-4 space-y-1 text-xs">
                  <li>• Header: {{1}} = Nombre del cliente</li>
                  <li>• Body: {{2}} = Fecha salida (texto completo)</li>
                  <li>• Body: {{3}} = Fecha retorno (texto completo)</li>
                  <li>• Body: {{4}} = Fecha límite (texto completo)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
