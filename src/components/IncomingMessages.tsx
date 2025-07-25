
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { CustomerAvatar } from '@/components/chat/CustomerAvatar';
import type { IncomingMessage } from '@/types/supabase-temp';

export function IncomingMessages() {
  const { data: incomingMessages = [], isLoading } = useQuery({
    queryKey: ['incoming-messages'],
    queryFn: async (): Promise<IncomingMessage[]> => {
      const { data, error } = await supabase
        .from('incoming_messages')
        .select(`
          *,
          customers (
            name,
            profile_image_url
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching incoming messages:', error);
        throw error;
      }
      
      return (data || []).map(msg => ({
        id: msg.id,
        whatsapp_message_id: msg.whatsapp_message_id,
        from_phone: msg.from_phone,
        customer_id: msg.customer_id,
        message_type: msg.message_type,
        message_content: msg.message_content,
        media_url: msg.media_url,
        timestamp: msg.timestamp,
        customers: msg.customers ? {
          name: msg.customers.name,
          profile_image_url: msg.customers.profile_image_url || undefined
        } : undefined
      }));
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return "bg-blue-100 text-blue-800";
      case 'image':
        return "bg-green-100 text-green-800";
      case 'audio':
        return "bg-purple-100 text-purple-800";
      case 'video':
        return "bg-red-100 text-red-800";
      case 'document':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Mensajes Entrantes
        </CardTitle>
        <CardDescription>
          Respuestas y mensajes recibidos de clientes vía WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando mensajes...</div>
          </div>
        ) : incomingMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay mensajes entrantes</p>
            <p className="text-sm mt-2">Los mensajes de clientes aparecerán aquí cuando se configuren los webhooks</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomingMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CustomerAvatar 
                        customerName={message.customers?.name || 'Cliente Desconocido'}
                        profileImageUrl={message.customers?.profile_image_url}
                        size="sm"
                      />
                      <div>
                        <div className="font-medium">
                          {message.customers?.name || 'Cliente Desconocido'}
                        </div>
                        {!message.customer_id && (
                          <div className="text-xs text-orange-600">
                            No registrado en sistema
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      +{message.from_phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getMessageTypeColor(message.message_type || 'text')} variant="secondary">
                      {message.message_type || 'text'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={message.message_content || ''}>
                      {message.message_content || '(Sin contenido de texto)'}
                      {message.media_url && (
                        <div className="text-xs text-blue-600 mt-1">
                          📎 Archivo adjunto
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {message.timestamp ? format(new Date(message.timestamp), 'dd/MM/yyyy HH:mm') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
