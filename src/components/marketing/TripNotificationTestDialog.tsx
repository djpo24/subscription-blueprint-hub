
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
    'Hola {{nombre_cliente}}! 📅 Te recordamos nuestros próximos viajes:\n\n' +
    '✈️ Salida desde Barranquilla: {{fecha_salida_baq}}\n' +
    '🔄 Retorno desde Curazao: {{fecha_retorno_cur}}\n' +
    '⏰ Fecha límite para entrega: {{fecha_limite_entrega}}\n\n' +
    '¡Reserva tu espacio ahora! 📦'
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

      // Crear entrada de log de notificación
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          notification_type: 'trip_notification_test',
          message: testMessage.replace('{{nombre_cliente}}', testCustomerName),
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creating notification log:', logError);
        throw new Error('Error al crear registro de notificación');
      }

      // Generar mensaje personalizado usando la función de la base de datos
      const testOutboundDate = new Date();
      testOutboundDate.setDate(testOutboundDate.getDate() + 7); // 7 días desde hoy
      
      const testReturnDate = new Date();
      testReturnDate.setDate(testReturnDate.getDate() + 14); // 14 días desde hoy
      
      const testDeadlineDate = new Date();
      testDeadlineDate.setDate(testDeadlineDate.getDate() + 5); // 5 días desde hoy

      const { data: personalizedMessage, error: messageError } = await supabase
        .rpc('generate_trip_notification_message', {
          customer_name_param: testCustomerName,
          template_param: testMessage,
          outbound_date: testOutboundDate.toISOString().split('T')[0],
          return_date: testReturnDate.toISOString().split('T')[0],
          deadline_date: testDeadlineDate.toISOString().split('T')[0]
        });

      if (messageError) {
        console.error('❌ Error generating personalized message:', messageError);
        throw new Error('Error al generar mensaje personalizado');
      }

      console.log('📝 Mensaje personalizado generado:', personalizedMessage);

      // Enviar mensaje usando la plantilla con parámetros estructurados
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: testPhone,
          message: personalizedMessage,
          useTemplate: true,
          templateName: templateName,
          templateLanguage: templateLanguage,
          customerId: null, // No hay customerId para mensajes de prueba
          templateParameters: {
            customerName: testCustomerName,
            outboundDate: testOutboundDate.toISOString().split('T')[0],
            returnDate: testReturnDate.toISOString().split('T')[0],
            deadlineDate: testDeadlineDate.toISOString().split('T')[0]
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
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={6}
              className="text-sm bg-gray-50"
              readOnly
            />
            <p className="text-xs text-blue-600">
              Este mensaje se personalizará automáticamente con fechas de ejemplo
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
