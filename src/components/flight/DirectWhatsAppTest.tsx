
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle } from 'lucide-react';

export function DirectWhatsAppTest() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendTestMessage = async () => {
    setIsSending(true);
    
    try {
      console.log('Enviando mensaje directo de WhatsApp...');
      
      // First create a notification log entry
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          notification_type: 'test',
          message: 'hola didi',
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating notification log:', logError);
        throw logError;
      }

      console.log('Notification log created:', notificationData);

      // Call the WhatsApp edge function - MANUAL MESSAGE ONLY
      const response = await supabase.functions.invoke('send-manual-message', {
        body: {
          notificationId: notificationData.id,
          phone: '+573014940399',
          message: 'hola didi'
        }
      });

      console.log('Edge function response:', response);

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw response.error;
      }

      if (response.data?.success) {
        toast({
          title: "✅ Mensaje enviado exitosamente",
          description: `Mensaje "hola didi" enviado a +573014940399`,
        });
        console.log('Mensaje enviado exitosamente:', response.data);
      } else {
        console.error('Error en la respuesta:', response.data);
        toast({
          title: "❌ Error al enviar mensaje",
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
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <MessageCircle className="h-5 w-5" />
          Enviar Mensaje a Didi
        </CardTitle>
        <CardDescription className="text-blue-600">
          Enviar "hola didi" a +573014940399
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-white rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Número:</strong> +573014940399<br/>
              <strong>Mensaje:</strong> "hola didi"
            </p>
          </div>
          
          <Button 
            onClick={sendTestMessage}
            disabled={isSending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? 'Enviando mensaje...' : 'Enviar "hola didi" por WhatsApp'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
