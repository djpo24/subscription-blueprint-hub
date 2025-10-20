import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateParams {
  messageTemplate: string;
  useTemplate?: boolean;
  templateName?: string;
  templateLanguage?: string;
}

export function useUpdateRedemptionMessageSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateParams) => {
      // Get the first (and only) settings record
      const { data: currentSettings } = await supabase
        .from('redemption_message_settings')
        .select('id')
        .single();

      if (currentSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('redemption_message_settings')
          .update({
            message_template: params.messageTemplate,
            use_template: params.useTemplate,
            template_name: params.templateName,
            template_language: params.templateLanguage,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSettings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new settings if none exist
        const { data, error } = await supabase
          .from('redemption_message_settings')
          .insert({
            message_template: params.messageTemplate,
            use_template: params.useTemplate,
            template_name: params.templateName,
            template_language: params.templateLanguage
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemption-message-settings'] });
      toast({
        title: 'Configuración actualizada',
        description: 'La plantilla de mensaje se ha guardado correctamente',
      });
    },
    onError: (error: Error) => {
      console.error('Error updating redemption message settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        variant: 'destructive',
      });
    },
  });
}
