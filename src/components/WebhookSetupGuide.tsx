
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Webhook, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WebhookSetupGuide() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const webhookUrl = 'https://bnuahsuehizwwcejqilm.supabase.co/functions/v1/whatsapp-webhook';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado",
      description: "URL copiada al portapapeles",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Webhook className="h-5 w-5" />
          Configuración de Webhooks WhatsApp
        </CardTitle>
        <CardDescription className="text-purple-600">
          Configura webhooks para recibir actualizaciones de estado y respuestas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Los webhooks te permiten recibir notificaciones en tiempo real sobre el estado de los mensajes enviados (entregado, leído) y respuestas de clientes.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. URL del Webhook</h4>
            <div className="flex items-center gap-2 p-3 bg-white rounded border">
              <code className="flex-1 text-sm text-gray-700 break-all">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. Configurar en Meta Developer Console</h4>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded border">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Callback URL:</strong> Usa la URL de arriba
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Verify Token:</strong> <Badge variant="secondary">ojitos_webhook_verify</Badge>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Webhook Fields:</strong> Selecciona "messages"
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Meta Developer Console
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">3. Eventos que recibirás</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-sm">Estados de Mensaje</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Enviado</li>
                  <li>• Entregado</li>
                  <li>• Leído</li>
                  <li>• Falló</li>
                </ul>
              </div>
              
              <div className="p-3 bg-white rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-sm">Mensajes Entrantes</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Respuestas de clientes</li>
                  <li>• Mensajes de texto</li>
                  <li>• Medios (futuro)</li>
                </ul>
              </div>
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Una vez configurado, podrás ver los estados de entrega en tiempo real y gestionar las respuestas de clientes automáticamente.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
