
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';

export function WhatsAppTemplateTest() {
  const [isSending, setIsSending] = useState(false);
  const [testPhone, setTestPhone] = useState('+573014940399');
  const [templateName, setTemplateName] = useState('hello_world');
  const [templateLanguage, setTemplateLanguage] = useState('en_US');
  const { toast } = useToast();

  const sendTemplateMessage = async () => {
    setIsSending(true);
    
    try {
      console.log('Enviando plantilla de WhatsApp:', { templateName, templateLanguage, testPhone });
      
      // First create a notification log entry
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          notification_type: 'template_test',
          message: `Plantilla: ${templateName} (${templateLanguage})`,
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
          message: `Plantilla: ${templateName}`,
          useTemplate: true,
          templateName: templateName,
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
          description: `Plantilla "${templateName}" enviada a ${testPhone}`,
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
                Nombre de la plantilla
              </label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="hello_world"
              />
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

          <div className="p-3 bg-white rounded border border-green-200">
            <p className="text-sm text-gray-700">
              <strong>Plantilla seleccionada:</strong> {templateName}<br/>
              <strong>Idioma:</strong> {templateLanguage}<br/>
              <strong>Número destino:</strong> {testPhone}
            </p>
          </div>
          
          <Button 
            onClick={sendTemplateMessage}
            disabled={isSending || !templateName.trim() || !testPhone.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Enviando plantilla...' : 'Enviar Plantilla de WhatsApp'}
          </Button>

          <div className="text-xs text-gray-500">
            <p><strong>Nota:</strong> Las plantillas deben estar aprobadas por Meta antes de poder usarse.</p>
            <p>La plantilla "hello_world" viene preaprobada para pruebas.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
