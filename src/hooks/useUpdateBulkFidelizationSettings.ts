import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UpdateBulkSettingsParams {
  redeemableTemplate: string;
  redeemableUseTemplate: boolean;
  redeemableTemplateName?: string;
  redeemableTemplateLanguage?: string;
  motivationalTemplate: string;
  motivationalUseTemplate: boolean;
  motivationalTemplateName?: string;
  motivationalTemplateLanguage?: string;
}

export function useUpdateBulkFidelizationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateBulkSettingsParams) => {
      const { data: existing } = await supabase
        .from('bulk_fidelization_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('bulk_fidelization_settings')
          .update({
            redeemable_template: params.redeemableTemplate,
            redeemable_use_template: params.redeemableUseTemplate,
            redeemable_template_name: params.redeemableTemplateName,
            redeemable_template_language: params.redeemableTemplateLanguage,
            motivational_template: params.motivationalTemplate,
            motivational_use_template: params.motivationalUseTemplate,
            motivational_template_name: params.motivationalTemplateName,
            motivational_template_language: params.motivationalTemplateLanguage,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('bulk_fidelization_settings')
          .insert({
            redeemable_template: params.redeemableTemplate,
            redeemable_use_template: params.redeemableUseTemplate,
            redeemable_template_name: params.redeemableTemplateName,
            redeemable_template_language: params.redeemableTemplateLanguage,
            motivational_template: params.motivationalTemplate,
            motivational_use_template: params.motivationalUseTemplate,
            motivational_template_name: params.motivationalTemplateName,
            motivational_template_language: params.motivationalTemplateLanguage,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulk-fidelization-settings'] });
      toast.success('Configuración guardada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating bulk fidelization settings:', error);
      toast.error('Error al guardar la configuración');
    }
  });
}
