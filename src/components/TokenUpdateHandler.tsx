
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function TokenUpdateHandler() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateToken = async () => {
      const newToken = 'EAAUbycRf1F0BO9po5k3rok0gj1NBf8E1f6NCCW6juXezkCUTUhiLc7YJ5IL4KTcepW9WBQ9QIDPZAsIu9E8n9KFZCrlTnjvxpCOt1ZBqSyi0ZBmhvDFqUZAQuJGgiAOygHf05Ehhkn9wuFHy8o2QmBUkYDWOJjNGh8OITnogsmFAardaHPTEVP8ZCiLlxP7QsGeBlZBVI19apvqZBH2TZAqvZAMcfC0HsBDEdnuvTjm2aelAAalogidBUZD';
      
      setIsUpdating(true);
      
      try {
        console.log('Actualizando token de Meta WhatsApp...');
        
        const { error } = await supabase.functions.invoke('update-meta-token', {
          body: { token: newToken }
        });

        if (error) {
          throw error;
        }

        toast({
          title: "Token actualizado exitosamente",
          description: "El nuevo token de Meta WhatsApp ha sido configurado correctamente",
        });

        console.log('Token de Meta WhatsApp actualizado exitosamente');

      } catch (error: any) {
        console.error('Error actualizando token:', error);
        toast({
          title: "Error al actualizar token",
          description: "No se pudo actualizar el token: " + (error.message || 'Error desconocido'),
          variant: "destructive"
        });
      } finally {
        setIsUpdating(false);
      }
    };

    // Ejecutar la actualización automáticamente al cargar el componente
    updateToken();
  }, [toast]);

  if (isUpdating) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-4 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-800 text-sm">Actualizando token de WhatsApp...</span>
        </div>
      </div>
    );
  }

  return null;
}
