
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  created_at: string;
  package_count: number;
}

interface DeleteCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
  onSuccess: () => void;
}

export function DeleteCustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess
}: DeleteCustomerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { data: userRole } = useCurrentUserRole();

  const handleDelete = async () => {
    // Verificar permisos antes de proceder
    if (userRole?.role !== 'admin' && userRole?.role !== 'traveler') {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para eliminar clientes",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    setIsDeleting(true);
    
    try {
      // Verificar si el cliente tiene paquetes asociados
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id')
        .eq('customer_id', customer.id)
        .limit(1);

      if (packagesError) throw packagesError;

      if (packages && packages.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: "Este cliente tiene paquetes asociados y no puede ser eliminado",
          variant: "destructive",
        });
        setIsDeleting(false);
        return;
      }

      // Eliminar el cliente
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);

      if (error) throw error;

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado exitosamente",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // No renderizar el diálogo si el usuario no tiene permisos
  if (userRole?.role !== 'admin' && userRole?.role !== 'traveler') {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El cliente "{customer.name}" será eliminado permanentemente del sistema.
            {customer.package_count > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                Advertencia: Este cliente tiene {customer.package_count} paquete(s) asociado(s).
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
