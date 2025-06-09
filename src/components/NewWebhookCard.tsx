
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Webhook, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NewWebhookCard() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const webhookUrl = 'https://bnuahsuehizwwcejqilm.supabase.co/functions/v1/whatsapp-webhook-v2';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado",
      description: "URL del nuevo webhook copiada al portapapeles",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-emerald-50 border-emerald-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Sparkles className="h-5 w-5" />
          Nuevo Webhook WhatsApp V2
        </CardTitle>
        <CardDescription className="text-emerald-600">
          Webhook completamente nuevo e independiente para configurar en Meta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Este es un webhook completamente nuevo que puedes usar como respaldo o para configuraciones adicionales. Funciona de manera independiente al webhook original.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-emerald-800">🆕 URL del Nuevo Webhook</h4>
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
                  <strong>Callback URL:</strong> Usa la URL de arriba
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Verify Token:</strong> <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">usa el mismo token que tienes configurado</Badge>
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
            <h4 className="font-medium mb-2 text-emerald-800">✨ Características del Nuevo Webhook</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-sm">Funcionalidad Completa</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Estados de mensajes</li>
                  <li>• Mensajes entrantes</li>
                  <li>• Perfiles de contacto</li>
                  <li>• Logging detallado</li>
                </ul>
              </div>
              
              <div className="p-3 bg-white rounded border border-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <Webhook className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-sm">Completamente Independiente</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• No afecta el webhook original</li>
                  <li>• Puede usarse como respaldo</li>
                  <li>• Configuración separada</li>
                  <li>• Logs independientes</li>
                </ul>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Este nuevo webhook utiliza los mismos tokens de Meta que tienes configurados en Supabase. Solo necesitas copiar la nueva URL y configurarla en Meta Developer Console.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
