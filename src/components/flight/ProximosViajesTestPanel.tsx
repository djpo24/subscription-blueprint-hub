
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestTube, Send, Eye, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ProximosViajesTestPanel() {
  const { toast } = useToast();
  
  // Form state
  const [testPhone, setTestPhone] = useState('');
  const [customerName, setCustomerName] = useState('Juan Pérez');
  const [outboundDate, setOutboundDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [templateLanguage, setTemplateLanguage] = useState('es_CO');
  
  // Test state
  const [isTesting, setIsTesting] = useState(false);
  const [showPayload, setShowPayload] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Generate formatted dates for WhatsApp
  const getFormattedDates = () => {
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

    const outboundDateText = outboundDate ? formatDateToSpanish(outboundDate) : '';
    const returnDateText = returnDate ? formatDateToSpanish(returnDate) : '';
    const deadlineDateText = deadlineDate ? formatDateToSpanish(deadlineDate) : '';
    
    return { outboundDateText, returnDateText, deadlineDateText };
  };

  // Generate WhatsApp payload (ACTUALIZADO para proximo_viaje_3)
  const generateWhatsAppPayload = () => {
    const { outboundDateText, returnDateText, deadlineDateText } = getFormattedDates();
    
    return {
      messaging_product: "whatsapp",
      to: testPhone.replace(/\D/g, '').startsWith('57') 
        ? testPhone.replace(/\D/g, '') 
        : `57${testPhone.replace(/\D/g, '')}`,
      type: "template",
      template: {
        name: "proximo_viaje_3",
        language: {
          code: templateLanguage
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: customerName        // {{1}} - nombre del cliente
              },
              {
                type: "text",
                text: outboundDateText   // {{2}} - fecha salida
              },
              {
                type: "text",
                text: returnDateText     // {{3}} - fecha retorno
              },
              {
                type: "text",
                text: deadlineDateText   // {{4}} - fecha límite
              }
            ]
          }
        ]
      }
    };
  };

  const handleTestTemplate = async () => {
    if (!testPhone.trim() || !customerName.trim() || !outboundDate || !returnDate || !deadlineDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    setLastResult(null);

    try {
      console.log('🧪 Iniciando test de plantilla proximo_viaje_3...');

      // Crear registro en notification_log
      const testMessage = `Test de plantilla proximo_viaje_3 para ${customerName}`;
      
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          notification_type: 'template_test',
          message: testMessage,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        throw new Error('Error al crear registro de notificación: ' + logError.message);
      }

      // Generar fechas formateadas
      const { outboundDateText, returnDateText, deadlineDateText } = getFormattedDates();

      // Enviar a WhatsApp usando la función edge
      const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: testPhone,
          message: testMessage,
          useTemplate: true,
          templateName: 'proximo_viaje_3',
          templateLanguage: templateLanguage,
          templateParameters: {
            customerName: customerName,
            outboundDate: outboundDate,
            returnDate: returnDate,
            deadlineDate: deadlineDate
          },
          customerId: null
        }
      });

      const result = {
        success: !whatsappError && !whatsappResponse?.error,
        error: whatsappError || whatsappResponse?.error,
        response: whatsappResponse,
        payload: generateWhatsAppPayload(),
        formattedDates: {
          outboundDateText,
          returnDateText,
          deadlineDateText
        }
      };

      setLastResult(result);

      if (result.success) {
        toast({
          title: "✅ Test exitoso",
          description: `Plantilla proximo_viaje_3 enviada correctamente a ${testPhone}`,
        });
      } else {
        toast({
          title: "❌ Test falló",
          description: result.error?.message || "Error desconocido",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('❌ Error en test:', error);
      
      const result = {
        success: false,
        error: error,
        payload: generateWhatsAppPayload()
      };
      
      setLastResult(result);
      
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo ejecutar el test",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Contenido copiado al portapapeles",
    });
  };

  const previewPayload = generateWhatsAppPayload();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Plantilla proximo_viaje_3
          </CardTitle>
          <CardDescription>
            Prueba la nueva plantilla de WhatsApp v3 - TODOS los parámetros van en BODY (sin header)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario de Test */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-phone">Número de Teléfono</Label>
              <Input
                id="test-phone"
                type="tel"
                placeholder="+573001234567"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customer-name">Nombre del Cliente (1)</Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="Juan Pérez"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outbound-date">Fecha de Salida (2)</Label>
              <Input
                id="outbound-date"
                type="date"
                value={outboundDate}
                onChange={(e) => setOutboundDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="return-date">Fecha de Retorno (3)</Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline-date">Fecha Límite (4)</Label>
              <Input
                id="deadline-date"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Idioma de Plantilla</Label>
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

          {/* Vista previa del payload */}
          {outboundDate && returnDate && deadlineDate && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vista Previa del Payload WhatsApp (proximo_viaje_3)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPayload(!showPayload)}
                  >
                    {showPayload ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showPayload && (
                <CardContent>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">📋 Estructura Plantilla proximo_viaje_3:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div><strong>1</strong> = Nombre del cliente (en body)</div>
                      <div><strong>2</strong> = Fecha de salida (en body)</div>
                      <div><strong>3</strong> = Fecha de retorno (en body)</div>
                      <div><strong>4</strong> = Fecha límite (en body)</div>
                      <div className="font-medium text-blue-800 mt-2">✅ Incluye direcciones y contactos fijos</div>
                    </div>
                  </div>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(previewPayload, null, 2))}
                      className="absolute top-2 right-2 z-10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(previewPayload, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">Fechas Formateadas (en español):</h4>
                    <div className="text-xs space-y-1">
                      <div><strong>1 Nombre:</strong> {customerName}</div>
                      <div><strong>2 Salida:</strong> {getFormattedDates().outboundDateText}</div>
                      <div><strong>3 Retorno:</strong> {getFormattedDates().returnDateText}</div>
                      <div><strong>4 Límite:</strong> {getFormattedDates().deadlineDateText}</div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Botón de Test */}
          <div className="flex justify-end">
            <Button 
              onClick={handleTestTemplate}
              disabled={isTesting || !testPhone.trim() || !outboundDate || !returnDate || !deadlineDate}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isTesting ? 'Enviando Test...' : 'Enviar Test'}
            </Button>
          </div>

          {/* Resultado del Test */}
          {lastResult && (
            <Card className={`border-2 ${lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  {lastResult.success ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-800">Test Exitoso</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-800">Test Falló</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!lastResult.success && lastResult.error && (
                  <div className="bg-red-100 p-3 rounded border border-red-200">
                    <h4 className="font-medium text-red-800 mb-2">Error Detallado:</h4>
                    <p className="text-sm text-red-700">{lastResult.error.message || JSON.stringify(lastResult.error)}</p>
                    {lastResult.error.error_code === 132000 && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Error 132000:</strong> El número de parámetros no coincide. 
                          Ahora todos los parámetros van en el BODY (sin header).
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {lastResult.response && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Respuesta de WhatsApp:</h4>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(lastResult.response, null, 2))}
                        className="absolute top-2 right-2 z-10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(lastResult.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {lastResult.payload && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Payload Enviado (Estructura Corregida):</h4>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(JSON.stringify(lastResult.payload, null, 2))}
                        className="absolute top-2 right-2 z-10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(lastResult.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
