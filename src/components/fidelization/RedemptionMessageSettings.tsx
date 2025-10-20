import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRedemptionMessageSettings } from '@/hooks/useRedemptionMessageSettings';
import { useUpdateRedemptionMessageSettings } from '@/hooks/useUpdateRedemptionMessageSettings';
import { useToast } from '@/hooks/use-toast';
import { Save, TestTube, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function RedemptionMessageSettings() {
  const { data: settings, isLoading } = useRedemptionMessageSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateRedemptionMessageSettings();
  const { toast } = useToast();

  const [messageTemplate, setMessageTemplate] = useState('');

  useEffect(() => {
    if (settings) {
      setMessageTemplate(settings.message_template);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings({ messageTemplate });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleTestMessage = () => {
    const testMessage = messageTemplate
      .replace(/{{nombre_cliente}}/g, 'María González')
      .replace(/{{puntos}}/g, '2500')
      .replace(/{{kilos}}/g, '2.5')
      .replace(/{{codigo}}/g, '1234');
    
    toast({
      title: "Vista previa del mensaje",
      description: testMessage,
      duration: 10000
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vista Previa de la Plantilla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Plantilla de Mensaje de Redención
          </CardTitle>
          <CardDescription>
            Esta es la plantilla que se enviará a los clientes al canjear sus puntos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-sm whitespace-pre-wrap font-sans">
              {messageTemplate
                .replace(/{{nombre_cliente}}/g, 'María González')
                .replace(/{{puntos}}/g, '2500')
                .replace(/{{kilos}}/g, '2.5')
                .replace(/{{codigo}}/g, '1234')}
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestMessage}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Vista previa en toast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Mensaje */}
      <Card>
        <CardHeader>
          <CardTitle>Editar Plantilla del Mensaje</CardTitle>
          <CardDescription>
            Personaliza el mensaje que recibirán los clientes al canjear sus puntos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="template">Plantilla del mensaje</Label>
              <Textarea
                id="template"
                placeholder="Escribe tu plantilla personalizada aquí..."
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              
              <Separator className="my-4" />
              
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  📝 Variables disponibles:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono">
                      {'{{nombre_cliente}}'}
                    </code>
                    <span className="text-gray-700 dark:text-gray-300">- Nombre completo del cliente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono">
                      {'{{puntos}}'}
                    </code>
                    <span className="text-gray-700 dark:text-gray-300">- Cantidad de puntos canjeados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono">
                      {'{{kilos}}'}
                    </code>
                    <span className="text-gray-700 dark:text-gray-300">- Kilos ganados en el canje</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono">
                      {'{{codigo}}'}
                    </code>
                    <span className="text-gray-700 dark:text-gray-300">- Código de verificación de 4 dígitos</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800 mt-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                  ⚠️ Parámetros requeridos de WhatsApp Business
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• El mensaje se envía como tipo "text" (mensaje de texto simple)</li>
                  <li>• Usa el token META_WHATSAPP_TOKEN configurado en los secretos</li>
                  <li>• Usa el phone_number_id META_WHATSAPP_PHONE_NUMBER_ID</li>
                  <li>• Formato: messaging_product: "whatsapp"</li>
                  <li>• El número debe estar en formato internacional sin "+"</li>
                </ul>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending || !messageTemplate.trim()} 
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
