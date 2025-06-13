
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface ChatViewEmptyStateProps {
  type: 'no-messages' | 'no-conversations' | 'select-chat';
  chatCount?: number;
}

export function ChatViewEmptyState({ type, chatCount = 0 }: ChatViewEmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case 'no-messages':
        return {
          title: 'No hay mensajes',
          description: 'Los mensajes de WhatsApp aparecerán aquí cuando los clientes escriban'
        };
      case 'no-conversations':
        return {
          title: 'No hay conversaciones',
          description: 'Las conversaciones aparecerán aquí cuando los clientes escriban'
        };
      case 'select-chat':
        return {
          title: chatCount > 0 ? 'Selecciona un chat' : 'No hay conversaciones',
          description: chatCount > 0 
            ? 'Haz clic en una conversación de la izquierda para ver los mensajes'
            : 'Las conversaciones aparecerán cuando los clientes escriban'
        };
      default:
        return {
          title: 'No hay mensajes',
          description: 'Los mensajes aparecerán aquí'
        };
    }
  };

  const { title, description } = getContent();

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </CardContent>
    </Card>
  );
}
