
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateAdminUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin';
}

export function useCreateAdminUser() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: CreateAdminUserData) => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Call the Edge Function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Usuario administrador creado",
        description: "El usuario administrador ha sido creado exitosamente",
      });
    },
    onError: (error: any) => {
      console.error('Error creating admin user:', error);
      let errorMessage = "No se pudo crear el usuario administrador";
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = "Este email ya está registrado";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Email inválido";
        } else if (error.message.includes('Insufficient permissions')) {
          errorMessage = "No tienes permisos suficientes para crear usuarios";
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = "Sesión expirada. Por favor inicia sesión nuevamente";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
}
