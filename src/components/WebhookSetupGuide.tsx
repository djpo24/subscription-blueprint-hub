
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
  
  const webhookUrl = 'WEBHOOK DESHABILITADO - No hay procesamiento automático';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado",
      description: "URL copiada al portapapeles"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            🚫 Sistema Manual - Webhook Eliminado
          </CardTitle>
          <CardDescription>
            El webhook ha sido completamente eliminado. El sistema opera en modo manual únicamente.
          </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">🔗 Nueva URL del Webhook V3</h4>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
              <code className="flex-1 text-sm text-gray-700 break-all font-mono">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">📋 Pasos para configurar en Meta Developer Console</h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Callback URL:</strong> Usa la nueva URL de arriba
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Verify Token:</strong> <Badge variant="secondary">ojitos_webhook_verify</Badge>
                </p>
                <p className="text-sm text-blue-700">
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

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Nueva URL del Webhook V3:</strong> Este webhook es completamente nuevo y está diseñado para funcionar sin problemas. 
              Reemplaza cualquier URL anterior en tu configuración de Meta Developer Console.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-medium mb-2">🛠️ Instrucciones detalladas</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Ve a <strong>Meta Developer Console</strong> usando el botón de arriba</li>
              <li>Selecciona tu aplicación de WhatsApp Business</li>
              <li>Ve a <strong>WhatsApp → Configuration</strong></li>
              <li>En la sección <strong>Webhooks</strong>, haz clic en <strong>Edit</strong></li>
              <li>Reemplaza la <strong>Callback URL</strong> con la nueva URL V3 de arriba</li>
              <li>Asegúrate de que el <strong>Verify Token</strong> sea: <code>ojitos_webhook_verify</code></li>
              <li>Selecciona el campo <strong>messages</strong> en Webhook fields</li>
              <li>Haz clic en <strong>Verify and Save</strong></li>
            </ol>
          </div>

          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>✅ Webhook V3 Completamente Nuevo:</strong> Esta versión incluye todas las funcionalidades mejoradas: 
              manejo de medios, estados de mensajes, logging detallado y mejor estabilidad.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
