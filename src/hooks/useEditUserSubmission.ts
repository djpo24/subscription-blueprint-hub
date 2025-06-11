
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'employee' | 'traveler';
  is_active: boolean;
}

interface FormData {
  first_name: string;
  last_name: string;
  countryCode: string;
  phoneNumber: string;
  role: 'admin' | 'employee' | 'traveler';
  is_active: boolean;
}

export function useEditUserSubmission(user: UserProfile | null, onSuccess: () => void) {
  const { toast } = useToast();

  const updateUserMutation = useMutation({
    mutationFn: async (userData: FormData) => {
      if (!user) throw new Error('No user selected');

      const fullPhone = userData.phoneNumber ? `${userData.countryCode}${userData.phoneNumber}` : null;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: fullPhone,
          role: userData.role,
          is_active: userData.is_active
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (formData: FormData) => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Error",
        description: "El nombre y apellido son obligatorios",
        variant: "destructive"
      });
      return;
    }

    updateUserMutation.mutate(formData);
  };

  return {
    handleSubmit,
    isLoading: updateUserMutation.isPending
  };
}
