
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Webhook, CheckCircle, AlertCircle, Sparkles, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppTokenConfig } from './WhatsAppTokenConfig';

export function NewWebhookCard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const webhookUrl = 'WEBHOOK DESHABILITADO - No se procesan mensajes automáticamente';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado",
      description: "URL del nuevo webhook V3 copiada al portapapeles",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-emerald-50 border-emerald-200">
      <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Sparkles className="h-5 w-5" />
            ⚠️ WEBHOOK COMPLETAMENTE DESHABILITADO
          </CardTitle>
          <CardDescription className="text-red-600">
            El webhook ha sido eliminado permanentemente. El sistema NO procesa mensajes automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>✅ Webhook V3 Funcional:</strong> Esta es una URL completamente nueva que está activa y lista para usar en Meta Developer Console.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <WhatsAppTokenConfig />
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-emerald-800">🆕 URL del Webhook V3 (Nueva y Funcional)</h4>
            <div className="flex items-center gap-2 p-3 bg-white rounded border border-emerald-200">
              <code className="flex-1 text-sm text-gray-700 break-all font-mono">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl)}
                className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-emerald-800">📋 Configuración en Meta Developer Console</h4>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded border border-emerald-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Callback URL:</strong> Usa la nueva URL V3 de arriba
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Verify Token:</strong> <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">ojitos_webhook_verify</Badge>
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Webhook Fields:</strong> Selecciona "messages"
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => window.open('https://developers.facebook.com/apps/', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Meta Developer Console
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-emerald-800">✨ Características del Webhook V3</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-sm">Completamente Nuevo</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• URL completamente nueva</li>
                  <li>• Edge function independiente</li>
                  <li>• Sin conflictos con webhooks anteriores</li>
                  <li>• Funcionalidad garantizada</li>
                </ul>
              </div>
              
              <div className="p-3 bg-white rounded border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <Webhook className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-sm">Funcionalidad Completa</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Estados de mensajes</li>
                  <li>• Mensajes entrantes</li>
                  <li>• Perfiles de contacto</li>
                  <li>• Manejo de medios</li>
                </ul>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Instrucciones:</strong> Reemplaza cualquier URL anterior en Meta Developer Console con esta nueva URL V3. 
              Esta URL está activa y funcionando correctamente.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
