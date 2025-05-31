
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface TestNotificationCardProps {
  onSendTestNotification: (params: { phone: string; message: string }) => void;
  isSendingTest: boolean;
}

export function TestNotificationCard({ onSendTestNotification, isSendingTest }: TestNotificationCardProps) {
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hola! Esta es una notificación de prueba del sistema de Envíos Ojitos.');

  const handleTestNotification = () => {
    if (!testPhone.trim()) {
      return;
    }
    onSendTestNotification({ phone: testPhone, message: testMessage });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Prueba de Notificación WhatsApp
        </CardTitle>
        <CardDescription>
          Envía una notificación de prueba para verificar la configuración
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Número de teléfono (incluye código de país)
            </label>
            <Input
              placeholder="+57 300 123 4567"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Mensaje de prueba
            </label>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
          </div>
        </div>
        <Button 
          onClick={handleTestNotification}
          disabled={isSendingTest || !testPhone.trim()}
          className="w-full md:w-auto"
        >
          {isSendingTest ? 'Enviando...' : 'Enviar Notificación de Prueba'}
        </Button>
      </CardContent>
    </Card>
  );
}
