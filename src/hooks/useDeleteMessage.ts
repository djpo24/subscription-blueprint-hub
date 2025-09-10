import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeleteMessageOptions {
  messageId: string;
  messageType: 'incoming' | 'sent';
  onDeleted?: () => void;
}

export function useDeleteMessage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const deleteMessage = async ({ messageId, messageType, onDeleted }: DeleteMessageOptions) => {
    if (!messageId) {
      toast({
        title: "Error",
        description: "ID de mensaje no válido",
        variant: "destructive"
      });
      return false;
    }

    setIsDeleting(true);

    try {
      const tableName = messageType === 'incoming' ? 'incoming_messages' : 'sent_messages';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      toast({
        title: "Mensaje eliminado",
        description: `El mensaje ${messageType === 'incoming' ? 'entrante' : 'enviado'} ha sido eliminado exitosamente`,
        variant: "default"
      });

      onDeleted?.();
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      
      let errorMessage = "No se pudo eliminar el mensaje";
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = "No tienes permisos para eliminar mensajes";
        } else if (error.message.includes('row-level security')) {
          errorMessage = "Acceso denegado. Solo los administradores pueden eliminar mensajes";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error al eliminar mensaje",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteMessage,
    isDeleting
  };
}