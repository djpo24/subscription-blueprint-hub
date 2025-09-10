import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  
  const webhookUrl = 'WEBHOOK COMPLETAMENTE DESHABILITADO';

  const testWebhookVerification = async () => {
    setIsTesting(true);
    try {
      const verifyUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=ojitos_webhook_verify&hub.challenge=1234567890`;
      const response = await fetch(verifyUrl, {
        method: 'GET'
      });
      const result = await response.text();
      
      if (response.ok && result === '1234567890') {
        setTestResults(prev => [...prev, {
          type: 'verification',
          status: 'success',
          message: 'Verificación exitosa con webhook V3',
          details: {
            challenge: result,
            status: response.status
          }
        }]);
        toast({
          title: "✅ Verificación exitosa",
          description: "El nuevo webhook V3 responde correctamente a la verificación"
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

  const testMessageStatusWebhook = async () => {
    setIsTesting(true);
    try {
      const mockStatusPayload = {
        entry: [{
          id: "test-entry-id",
          changes: [{
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "573001234567",
                phone_number_id: "test-phone-id"
              },
              statuses: [{
                id: "test-message-id-123",
                status: "delivered",
                timestamp: Math.floor(Date.now() / 1000).toString(),
                recipient_id: "573014940399"
              }]
            },
            field: "messages"
          }]
        }]
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockStatusPayload)
      });
      const result = await response.text();
      
      if (response.ok) {
        setTestResults(prev => [...prev, {
          type: 'message_status',
          status: 'success',
          message: 'Estado de mensaje procesado correctamente por webhook V3',
          details: {
            response: result,
            payload: mockStatusPayload
          }
        }]);
        toast({
          title: "✅ Test de estado exitoso",
          description: "El webhook V3 procesó el estado del mensaje correctamente"
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

  const testIncomingMessageWebhook = async () => {
    setIsTesting(true);
    try {
      const mockMessagePayload = {
        entry: [{
          id: "test-entry-id",
          changes: [{
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "573001234567",
                phone_number_id: "test-phone-id"
              },
              contacts: [{
                profile: {
                  name: "Usuario de Prueba"
                },
                wa_id: "573014940399"
              }],
              messages: [{
                from: "573014940399",
                id: "test-incoming-msg-123",
                timestamp: Math.floor(Date.now() / 1000).toString(),
                text: {
                  body: "Hola, este es un mensaje de prueba para webhook V3"
                },
                type: "text"
              }]
            },
            field: "messages"
          }]
        }]
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockMessagePayload)
      });
      const result = await response.text();
      
      if (response.ok) {
        setTestResults(prev => [...prev, {
          type: 'incoming_message',
          status: 'success',
          message: 'Mensaje entrante procesado correctamente por webhook V3',
          details: {
            response: result,
            payload: mockMessagePayload
          }
        }]);
        toast({
          title: "✅ Test de mensaje entrante exitoso",
          description: "El webhook V3 procesó el mensaje entrante correctamente"
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
      description: "La nueva URL del webhook V3 se ha copiado al portapapeles"
    });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Probador de Webhook V3
        </CardTitle>
        <CardDescription>
          Prueba el funcionamiento del nuevo webhook V3 de WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
          <code className="flex-1 text-sm text-gray-700 break-all font-mono">
            {webhookUrl}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={copyWebhookUrl}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Tipo de Prueba</label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verification">Verificación del Webhook</SelectItem>
                <SelectItem value="message_status">Estado de Mensaje</SelectItem>
                <SelectItem value="incoming_message">Mensaje Entrante</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={runTest} 
            disabled={isTesting}
            className="px-6"
          >
            <Send className="h-4 w-4 mr-2" />
            {isTesting ? 'Probando...' : 'Probar'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Resultados de las Pruebas</h4>
              <Button variant="outline" size="sm" onClick={clearResults}>
                Limpiar Resultados
              </Button>
            </div>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <Alert 
                  key={index} 
                  className={result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
                >
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={result.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong>{result.type}:</strong> {result.message}
                      </div>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status === 'success' ? 'Éxito' : 'Error'}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Estas pruebas verifican que el nuevo webhook V3 esté funcionando correctamente. 
            Si todas las pruebas pasan, el webhook está listo para recibir eventos de WhatsApp.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
