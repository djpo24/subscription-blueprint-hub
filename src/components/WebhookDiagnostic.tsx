
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw, Bug } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function WebhookDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();
  
  const webhookUrl = 'https://tkwffswlgpzxyyuhdrrp.supabase.co/functions/v1/whatsapp-webhook-v3';
  const verifyToken = 'ojitos_webhook_verify';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: `${label} copiado al portapapeles`,
    });
  };

  const testWebhookDirectly = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Test 1: Verificar que el webhook responde a GET con parámetros de verificación
      console.log('🔍 Probando verificación del webhook...');
      const verifyUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=test123456`;
      
      const verifyResponse = await fetch(verifyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain'
        }
      });
      
      const challengeResponse = await verifyResponse.text();
      console.log('📋 Respuesta de verificación:', { status: verifyResponse.status, response: challengeResponse });
      
      if (verifyResponse.ok && challengeResponse === 'test123456') {
        setResults(prev => [...prev, {
          test: 'Verificación GET',
          status: 'success',
          message: 'El webhook responde correctamente a la verificación',
          details: `Status: ${verifyResponse.status}, Challenge: ${challengeResponse}`
        }]);
      } else {
        setResults(prev => [...prev, {
          test: 'Verificación GET',
          status: 'error',
          message: 'El webhook no responde correctamente a la verificación',
          details: `Status: ${verifyResponse.status}, Response: ${challengeResponse}`
        }]);
      }

      // Test 2: Verificar que el webhook responde a POST
      console.log('🔍 Probando POST al webhook...');
      const postResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: []
        })
      });
      
      const postResult = await postResponse.text();
      console.log('📋 Respuesta POST:', { status: postResponse.status, response: postResult });
      
      if (postResponse.ok) {
        setResults(prev => [...prev, {
          test: 'Endpoint POST',
          status: 'success',
          message: 'El webhook acepta requests POST correctamente',
          details: `Status: ${postResponse.status}, Response: ${postResult}`
        }]);
      } else {
        setResults(prev => [...prev, {
          test: 'Endpoint POST',
          status: 'error',
          message: 'El webhook no acepta requests POST',
          details: `Status: ${postResponse.status}, Response: ${postResult}`
        }]);
      }

      // Test 3: Verificar tokens en base de datos
      console.log('🔍 Verificando tokens en base de datos...');
      const { data: accessTokenData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_TOKEN' });
      const { data: phoneIdData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_PHONE_NUMBER_ID' });
      const { data: verifyTokenData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_VERIFY_TOKEN' });
      
      console.log('📋 Tokens encontrados:', {
        accessToken: !!accessTokenData,
        phoneId: !!phoneIdData,
        verifyToken: !!verifyTokenData,
        verifyTokenMatch: verifyTokenData === verifyToken
      });

      setResults(prev => [...prev, {
        test: 'Tokens en BD',
        status: accessTokenData && phoneIdData && verifyTokenData ? 'success' : 'warning',
        message: `Tokens encontrados: Access(${!!accessTokenData}), Phone(${!!phoneIdData}), Verify(${!!verifyTokenData})`,
        details: `Verify token coincide: ${verifyTokenData === verifyToken ? 'Sí' : 'No'}`
      }]);

      // Test 4: Validar token de acceso con Meta API
      if (accessTokenData) {
        console.log('🔍 Validando token de acceso con Meta...');
        try {
          const metaResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${accessTokenData}`);
          const metaResult = await metaResponse.json();
          
          if (metaResponse.ok && metaResult.id) {
            setResults(prev => [...prev, {
              test: 'Token Meta API',
              status: 'success',
              message: 'Token de acceso válido en Meta API',
              details: `Account: ${metaResult.name || metaResult.id}`
            }]);
          } else {
            setResults(prev => [...prev, {
              test: 'Token Meta API',
              status: 'error',
              message: 'Token de acceso inválido en Meta API',
              details: metaResult.error?.message || 'Error desconocido'
            }]);
          }
        } catch (error: any) {
          setResults(prev => [...prev, {
            test: 'Token Meta API',
            status: 'error',
            message: 'Error al validar token con Meta API',
            details: error.message
          }]);
        }
      }

    } catch (error: any) {
      console.error('❌ Error en diagnóstico:', error);
      setResults(prev => [...prev, {
        test: 'Diagnóstico General',
        status: 'error',
        message: 'Error durante el diagnóstico',
        details: error.message
      }]);
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Diagnóstico de Webhook WhatsApp
        </CardTitle>
        <CardDescription>
          Diagnostica problemas con la configuración del webhook en Meta Developer Console
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error reportado:</strong> "No se ha podido validar la URL de devolución de llamada ni el identificador de verificación"
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">🔗 URL del Webhook V3</h4>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
              <code className="flex-1 text-sm text-gray-700 break-all font-mono">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl, 'URL del webhook')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">🔐 Token de Verificación</h4>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
              <code className="flex-1 text-sm text-gray-700">
                {verifyToken}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(verifyToken, 'Token de verificación')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={testWebhookDirectly} 
            disabled={testing}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Ejecutando Diagnóstico...' : 'Ejecutar Diagnóstico Completo'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">📊 Resultados del Diagnóstico</h4>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className={`p-3 rounded border ${getStatusColor(result.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.test}</div>
                        <div className="text-sm">{result.message}</div>
                        {result.details && (
                          <div className="text-xs mt-1 opacity-75">{result.details}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-medium">🛠️ Soluciones Comunes</h4>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>1. Verificar URL:</strong> Asegúrate de usar exactamente esta URL en Meta Developer Console: 
                <code className="block mt-1 text-xs bg-white p-1 rounded">{webhookUrl}</code>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>2. Token de Verificación:</strong> Debe ser exactamente: <code>ojitos_webhook_verify</code>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>3. Webhook Fields:</strong> En Meta Developer Console, selecciona solo "messages" en Webhook fields
              </AlertDescription>
            </Alert>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>4. HTTPS:</strong> Meta requiere que la URL sea HTTPS (nuestra URL ya lo es)
              </AlertDescription>
            </Alert>
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
      </CardContent>
    </Card>
  );
}
