
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { TestTube, Send, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export function WebhookTester() {
  const [testType, setTestType] = useState('verification');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();

  const webhookUrl = 'https://bnuahsuehizwwcejqilm.supabase.co/functions/v1/whatsapp-webhook';

  // Test webhook verification
  const testWebhookVerification = async () => {
    setIsTesting(true);
    try {
      const verifyUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=ojitos_webhook_verify&hub.challenge=1234567890`;
      
      const response = await fetch(verifyUrl, {
        method: 'GET',
      });

      const result = await response.text();
      
      if (response.ok && result === '1234567890') {
        setTestResults(prev => [...prev, {
          type: 'verification',
          status: 'success',
          message: 'Verificación exitosa',
          details: { challenge: result, status: response.status }
        }]);
        toast({
          title: "✅ Verificación exitosa",
          description: "El webhook responde correctamente a la verificación",
        });
      } else {
        throw new Error(`Verificación falló: ${response.status} - ${result}`);
      }
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        type: 'verification',
        status: 'error',
        message: `Error en verificación: ${error.message}`,
        details: error
      }]);
      toast({
        title: "❌ Error en verificación",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Test message status webhook
  const testMessageStatusWebhook = async () => {
    setIsTesting(true);
    try {
      const mockStatusPayload = {
        entry: [
          {
            id: "test-entry-id",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "573001234567",
                    phone_number_id: "test-phone-id"
                  },
                  statuses: [
                    {
                      id: "test-message-id-123",
                      status: "delivered",
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      recipient_id: "573014940399"
                    }
                  ]
                },
                field: "messages"
              }
            ]
          }
        ]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockStatusPayload)
      });

      const result = await response.text();
      
      if (response.ok) {
        setTestResults(prev => [...prev, {
          type: 'message_status',
          status: 'success',
          message: 'Estado de mensaje procesado correctamente',
          details: { response: result, payload: mockStatusPayload }
        }]);
        toast({
          title: "✅ Test de estado exitoso",
          description: "El webhook procesó el estado del mensaje correctamente",
        });
      } else {
        throw new Error(`Test falló: ${response.status} - ${result}`);
      }
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        type: 'message_status',
        status: 'error',
        message: `Error en test de estado: ${error.message}`,
        details: error
      }]);
      toast({
        title: "❌ Error en test de estado",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Test incoming message webhook
  const testIncomingMessageWebhook = async () => {
    setIsTesting(true);
    try {
      const mockMessagePayload = {
        entry: [
          {
            id: "test-entry-id",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "573001234567",
                    phone_number_id: "test-phone-id"
                  },
                  contacts: [
                    {
                      profile: {
                        name: "Usuario de Prueba"
                      },
                      wa_id: "573014940399"
                    }
                  ],
                  messages: [
                    {
                      from: "573014940399",
                      id: "test-incoming-msg-123",
                      timestamp: Math.floor(Date.now() / 1000).toString(),
                      text: {
                        body: "Hola, este es un mensaje de prueba"
                      },
                      type: "text"
                    }
                  ]
                },
                field: "messages"
              }
            ]
          }
        ]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockMessagePayload)
      });

      const result = await response.text();
      
      if (response.ok) {
        setTestResults(prev => [...prev, {
          type: 'incoming_message',
          status: 'success',
          message: 'Mensaje entrante procesado correctamente',
          details: { response: result, payload: mockMessagePayload }
        }]);
        toast({
          title: "✅ Test de mensaje entrante exitoso",
          description: "El webhook procesó el mensaje entrante correctamente",
        });
      } else {
        throw new Error(`Test falló: ${response.status} - ${result}`);
      }
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        type: 'incoming_message',
        status: 'error',
        message: `Error en test de mensaje: ${error.message}`,
        details: error
      }]);
      toast({
        title: "❌ Error en test de mensaje",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const runTest = () => {
    switch (testType) {
      case 'verification':
        testWebhookVerification();
        break;
      case 'message_status':
        testMessageStatusWebhook();
        break;
      case 'incoming_message':
        testIncomingMessageWebhook();
        break;
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "La URL del webhook se ha copiado al portapapeles",
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <TestTube className="h-5 w-5" />
          Probador de Webhook WhatsApp
        </CardTitle>
        <CardDescription className="text-yellow-600">
          Prueba tu webhook localmente antes de configurarlo en Facebook
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Estas pruebas simulan los eventos que Facebook envía a tu webhook. Úsalas para verificar que todo funciona antes de la configuración final.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL del Webhook</label>
            <div className="flex items-center gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Prueba</label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verification">Verificación de Webhook</SelectItem>
                <SelectItem value="message_status">Estado de Mensaje</SelectItem>
                <SelectItem value="incoming_message">Mensaje Entrante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={runTest}
              disabled={isTesting}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isTesting ? 'Ejecutando...' : 'Ejecutar Prueba'}
            </Button>
            
            {testResults.length > 0 && (
              <Button variant="outline" onClick={clearResults}>
                Limpiar Resultados
              </Button>
            )}
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Resultados de las Pruebas:</h3>
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded border ${
                    result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{result.type}</Badge>
                        <span className="text-sm font-medium">{result.message}</span>
                      </div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">Ver detalles</summary>
                          <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-40">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximos pasos:</strong> Una vez que todas las pruebas pasen exitosamente, puedes configurar esta URL en la Meta Developer Console con confianza.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
