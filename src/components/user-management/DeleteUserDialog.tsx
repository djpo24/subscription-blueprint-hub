
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'employee' | 'traveler';
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

export function DeleteUserDialog({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) {
  const { toast } = useToast();

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user selected');

      // Delete user profile first (this will cascade delete the auth user)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.user_id);
      if (authError) throw authError;
    },
    onSuccess: () => {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    deleteUserMutation.mutate();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Eliminar Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar a este usuario? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Nombre:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.role}</p>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
