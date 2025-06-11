
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { useCreateAdminUser } from '@/hooks/useCreateAdminUser';

export function CreateAdminUserButton() {
  const createAdminMutation = useCreateAdminUser();

  const handleCreateAdmin = () => {
    createAdminMutation.mutate({
      email: 'djpo24@gmail.com',
      password: 'Dela881224',
      first_name: 'Didier',
      last_name: 'Pedroza',
      phone: '+573014940399',
      role: 'admin'
    });
  };

  return (
    <Button 
      onClick={handleCreateAdmin}
      disabled={createAdminMutation.isPending}
      className="flex items-center gap-2"
    >
      {createAdminMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Shield className="h-4 w-4" />
      )}
      {createAdminMutation.isPending ? 'Creando Admin...' : 'Crear Usuario Admin'}
    </Button>
  );
}
