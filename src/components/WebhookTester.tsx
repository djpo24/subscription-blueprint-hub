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
  const {
    toast
  } = useToast();
  const webhookUrl = 'https://bnuahsuehizwwcejqilm.supabase.co/functions/v1/whatsapp-webhook';

  // Test webhook verification with the correct token from Meta
  const testWebhookVerification = async () => {
    setIsTesting(true);
    try {
      const verifyUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=1371636570719904&hub.challenge=1234567890`;
      const response = await fetch(verifyUrl, {
        method: 'GET'
      });
      const result = await response.text();
      if (response.ok && result === '1234567890') {
        setTestResults(prev => [...prev, {
          type: 'verification',
          status: 'success',
          message: 'Verificación exitosa con token de Meta',
          details: {
            challenge: result,
            status: response.status
          }
        }]);
        toast({
          title: "✅ Verificación exitosa",
          description: "El webhook responde correctamente a la verificación de Meta"
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
          message: 'Estado de mensaje procesado correctamente',
          details: {
            response: result,
            payload: mockStatusPayload
          }
        }]);
        toast({
          title: "✅ Test de estado exitoso",
          description: "El webhook procesó el estado del mensaje correctamente"
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
                  body: "Hola, este es un mensaje de prueba"
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
          message: 'Mensaje entrante procesado correctamente',
          details: {
            response: result,
            payload: mockMessagePayload
          }
        }]);
        toast({
          title: "✅ Test de mensaje entrante exitoso",
          description: "El webhook procesó el mensaje entrante correctamente"
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
      description: "La URL del webhook se ha copiado al portapapeles"
    });
  };
  const clearResults = () => {
    setTestResults([]);
  };
  return;
}