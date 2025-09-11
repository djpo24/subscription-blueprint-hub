
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, TestTube } from 'lucide-react';

interface TripNotificationTestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripNotificationTestDialog({ 
  isOpen, 
  onOpenChange 
}: TripNotificationTestDialogProps) {
  const { toast } = useToast();
  const [testPhone, setTestPhone] = useState('');
  const [testCustomerName, setTestCustomerName] = useState('');
  const [templateName, setTemplateName] = useState('proximos_viajes');
  const [templateLanguage, setTemplateLanguage] = useState('es_CO');
  const [testMessage, setTestMessage] = useState(
    '¡Hola {{nombre_cliente}}! 👋\n\n' +
    '🛫 **IMPORTANTE: Próximo viaje programado**\n\n' +
    'Te informamos que tenemos un viaje programado próximamente:\n\n' +
    '📅 **Salida desde Barranquilla:** {{fecha_salida_baq}}\n' +
    '📅 **Retorno desde Curazao:** {{fecha_retorno_cur}}\n\n' +
    '⏰ **FECHA LÍMITE para entrega de encomiendas:**\n' +
    '🗓️ **{{fecha_limite_entrega}} antes de las 3:00 PM**\n\n' +
    '📦 Si tienes alguna encomienda para enviar, por favor asegúrate de entregarla antes de la fecha límite.\n\n' +
    '📞 Para coordinar la entrega o resolver dudas, contáctanos.\n\n' +
    '✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao'
  );
  const [isSending, setIsSending] = useState(false);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testPhone.trim() || !testCustomerName.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('🧪 Enviando mensaje de prueba de plantilla...', {
        phone: testPhone,
        customerName: testCustomerName,
        templateName,
        templateLanguage
      });

      // Crear entrada de log usando el mismo tipo que funciona en arrivals
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          notification_type: 'manual_reply', // Usar el mismo tipo que funciona
          message: testMessage.replace('{{nombre_cliente}}', testCustomerName),
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creating notification log:', logError);
        throw new Error('Error al crear registro de notificación');
      }

      // Generar fechas de ejemplo para la prueba
      const testOutboundDate = new Date();
      testOutboundDate.setDate(testOutboundDate.getDate() + 7); // 7 días desde hoy
      
      const testReturnDate = new Date();
      testReturnDate.setDate(testReturnDate.getDate() + 14); // 14 días desde hoy
      
      const testDeadlineDate = new Date();
      testDeadlineDate.setDate(testDeadlineDate.getDate() + 5); // 5 días desde hoy

      // Formatear fechas como ISO strings (YYYY-MM-DD)
      const outboundDateStr = testOutboundDate.toISOString().split('T')[0];
      const returnDateStr = testReturnDate.toISOString().split('T')[0];
      const deadlineDateStr = testDeadlineDate.toISOString().split('T')[0];

      console.log('📅 Fechas para la prueba:', {
        outbound: outboundDateStr,
        return: returnDateStr,
        deadline: deadlineDateStr
      });

      // Enviar exactamente como lo hace useArrivalNotifications
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: testPhone,
          message: testMessage.replace('{{nombre_cliente}}', testCustomerName),
          useTemplate: true,
          templateName: templateName,
          templateLanguage: templateLanguage,
          customerId: null,
          templateParameters: {
            customerName: testCustomerName,
            outboundDate: outboundDateStr,
            returnDate: returnDateStr,
            deadlineDate: deadlineDateStr
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

      console.log('✅ Mensaje de prueba enviado exitosamente:', responseData);

      toast({
        title: "✅ Mensaje de prueba enviado",
        description: `Mensaje enviado a ${testPhone} usando plantilla ${templateName}`,
      });

      // Limpiar formulario
      setTestPhone('');
      setTestCustomerName('');
      setTemplateName('proximos_viajes');
      setTemplateLanguage('es_CO');
      
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Error en mensaje de prueba:', error);
      toast({
        title: "❌ Error",
        description: error.message || "No se pudo enviar el mensaje de prueba",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getPreviewMessage = () => {
    const sampleOutboundDate = 'lunes 15 de julio de 2024';
    const sampleReturnDate = 'domingo 21 de julio de 2024';
    const sampleDeadlineDate = 'viernes 12 de julio de 2024';
    
    return testMessage
      .replace('{{nombre_cliente}}', testCustomerName || 'Juan Pérez')
      .replace('{{fecha_salida_baq}}', sampleOutboundDate)
      .replace('{{fecha_retorno_cur}}', sampleReturnDate)
      .replace('{{fecha_limite_entrega}}', sampleDeadlineDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Enviar Mensaje de Prueba
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSendTest} className="space-y-4">
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
            <p className="text-xs text-gray-500">
              Incluye el código de país (ej: +57 para Colombia, +599 para Curazao)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-customer-name">Nombre del Cliente (para prueba)</Label>
            <Input
              id="test-customer-name"
              type="text"
              placeholder="Juan Pérez"
              value={testCustomerName}
              onChange={(e) => setTestCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plantilla</Label>
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
              <Label>Idioma</Label>
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

          <div className="space-y-2">
            <Label>Vista Previa del Mensaje</Label>
            <Textarea
              value={getPreviewMessage()}
              rows={12}
              className="text-sm bg-gray-50"
              readOnly
            />
            <p className="text-xs text-blue-600">
              Esta es la vista previa con fechas de ejemplo que se enviará usando la plantilla WhatsApp
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSending}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSending ? 'Enviando...' : 'Enviar Prueba'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
