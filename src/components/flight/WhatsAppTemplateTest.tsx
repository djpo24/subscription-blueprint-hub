
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface TemplateConfig {
  name: string;
  description: string;
  language: string;
  category: string;
  hasParameters: boolean;
  parameters?: string[];
  format?: string;
}

const AVAILABLE_TEMPLATES: Record<string, TemplateConfig> = {
  'hello_world': {
    name: 'hello_world',
    description: 'Plantilla básica de saludo (preaprobada)',
    language: 'en_US',
    category: 'greeting',
    hasParameters: false
  },
  'customer_service_hello': {
    name: 'customer_service_hello',
    description: 'Saludo de servicio al cliente',
    language: 'es',
    category: 'customer_service',
    hasParameters: false
  },
  'customer_service_followup': {
    name: 'customer_service_followup',
    description: 'Seguimiento de servicio al cliente',
    language: 'es',
    category: 'customer_service',
    hasParameters: true,
    parameters: ['Motivo de consulta']
  },
  'package_arrival_notification': {
    name: 'package_arrival_notification',
    description: 'Notificación de llegada de paquete',
    language: 'es',
    category: 'logistics',
    hasParameters: true,
    parameters: ['Nombre cliente', 'Número tracking', 'Destino', 'Dirección', 'Símbolo moneda', 'Monto'],
    format: `📦 Hola {{1}}, 
tu encomienda {{2}} ha llegado a 📍{{3}}.

🏢 Ya puedes recogerla en la dirección: {{4}}.

💰 Te recordamos el valor a pagar: {{5}}{{6}}.

🙏 ¡Gracias por confiar en nosotros!`
  },
  'payment_reminder': {
    name: 'payment_reminder',
    description: 'Recordatorio de pago pendiente',
    language: 'es',
    category: 'finance',
    hasParameters: true,
    parameters: ['Monto', 'Fecha límite']
  }
};

export function WhatsAppTemplateTest() {
  const [isSending, setIsSending] = useState(false);
  const [testPhone, setTestPhone] = useState('+573014940399');
  const [selectedTemplate, setSelectedTemplate] = useState('hello_world');
  const [templateLanguage, setTemplateLanguage] = useState('en_US');
  const [messageParameters, setMessageParameters] = useState('');
  const { toast } = useToast();

  const currentTemplate = AVAILABLE_TEMPLATES[selectedTemplate];

  const sendTemplateMessage = async () => {
    setIsSending(true);
    
    try {
      console.log('Enviando plantilla de WhatsApp:', { 
        templateName: selectedTemplate, 
        templateLanguage, 
        testPhone,
        parameters: messageParameters
      });
      
      // First create a notification log entry
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          notification_type: 'template_test',
          message: `Plantilla: ${selectedTemplate} (${templateLanguage})`,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating notification log:', logError);
        throw logError;
      }

      console.log('Notification log created:', notificationData);

      // Call the WhatsApp edge function with template parameters
      const response = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: testPhone,
          message: messageParameters || `Plantilla: ${selectedTemplate}`,
          useTemplate: true,
          templateName: selectedTemplate,
          templateLanguage: templateLanguage
        }
      });

      console.log('Edge function response:', response);

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw response.error;
      }

      if (response.data?.success) {
        toast({
          title: "✅ Plantilla enviada exitosamente",
          description: `Plantilla "${selectedTemplate}" enviada a ${testPhone}`,
        });
        console.log('Plantilla enviada exitosamente:', response.data);
      } else {
        console.error('Error en la respuesta:', response.data);
        toast({
          title: "❌ Error al enviar plantilla",
          description: response.data?.error || "Error desconocido",
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error en la prueba:', error);
      toast({
        title: "❌ Error en la prueba",
        description: error.message || "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <MessageSquare className="h-5 w-5" />
            Prueba de Plantillas WhatsApp
          </CardTitle>
          <CardDescription className="text-green-600">
            Enviar mensajes usando plantillas aprobadas de WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Número de teléfono
                </label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Plantilla disponible
                </label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  setSelectedTemplate(value);
                  const template = AVAILABLE_TEMPLATES[value];
                  setTemplateLanguage(template.language);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AVAILABLE_TEMPLATES).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{template.name}</span>
                          <span className="text-xs text-gray-500">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Idioma de la plantilla
              </label>
              <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_US">Inglés (en_US)</SelectItem>
                  <SelectItem value="es">Español (es)</SelectItem>
                  <SelectItem value="es_ES">Español España (es_ES)</SelectItem>
                  <SelectItem value="es_MX">Español México (es_MX)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentTemplate?.hasParameters && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Parámetros de la plantilla
                </label>
                <Textarea
                  value={messageParameters}
                  onChange={(e) => setMessageParameters(e.target.value)}
                  placeholder={`Parámetros requeridos: ${currentTemplate.parameters?.join(', ') || ''}`}
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta plantilla requiere parámetros: {currentTemplate.parameters?.join(', ') || 'Ninguno'}
                </p>
              </div>
            )}

            {/* Mostrar formato de la plantilla si está disponible */}
            {currentTemplate?.format && (
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <h4 className="font-medium text-sm mb-2 text-blue-800">Formato de la plantilla:</h4>
                <pre className="text-sm text-blue-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                  {currentTemplate.format}
                </pre>
              </div>
            )}

            <div className="p-4 bg-white rounded border border-green-200">
              <h4 className="font-medium text-sm mb-2">Detalles de la plantilla:</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Nombre:</strong> {currentTemplate?.name}</p>
                <p><strong>Descripción:</strong> {currentTemplate?.description}</p>
                <p><strong>Idioma:</strong> {templateLanguage}</p>
                <p><strong>Categoría:</strong> {currentTemplate?.category}</p>
                <p><strong>Número destino:</strong> {testPhone}</p>
                {currentTemplate?.hasParameters && (
                  <p><strong>Tiene parámetros:</strong> Sí ({currentTemplate.parameters?.length || 0})</p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={sendTemplateMessage}
              disabled={isSending || !selectedTemplate.trim() || !testPhone.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? 'Enviando plantilla...' : 'Enviar Plantilla de WhatsApp'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Clock className="h-5 w-5" />
            Cuándo se usan plantillas automáticamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Ventana de 24 horas</p>
                <p className="text-gray-600">Después de 24 horas sin respuesta del cliente, solo se pueden usar plantillas aprobadas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Primer contacto</p>
                <p className="text-gray-600">Para clientes que nunca han respondido, se usa plantilla automáticamente.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Detección automática</p>
                <p className="text-gray-600">El sistema detecta automáticamente cuándo usar plantillas y reintenta si es necesario.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Configuración en Meta Developer Console</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Pasos para configurar plantillas en Meta:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Ve a <strong>Meta for Developers</strong> → Tu App → WhatsApp → Message Templates</li>
                <li>Crea nuevas plantillas con los nombres exactos listados arriba</li>
                <li>Configura el idioma correspondiente (es, en_US, etc.)</li>
                <li>Espera la aprobación de Meta (puede tomar 24-48 horas)</li>
                <li>Una vez aprobadas, las plantillas aparecerán en el sistema automáticamente</li>
              </ol>
            </div>
            <div className="p-3 bg-yellow-100 rounded">
              <p className="font-medium text-yellow-800">💡 Consejo:</p>
              <p className="text-yellow-700">La plantilla "hello_world" viene preaprobada y es ideal para pruebas iniciales.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
