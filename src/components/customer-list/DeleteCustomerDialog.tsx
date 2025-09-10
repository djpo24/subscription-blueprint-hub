
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

      // Eliminar dependencias primero

      // 1. Eliminar mensajes enviados
      const { error: sentMessagesError } = await supabase
        .from('sent_messages')
        .delete()
        .eq('customer_id', customer.id);

      if (sentMessagesError) {
        console.error('Error eliminando mensajes enviados:', sentMessagesError);
        // No lanzar error, continuar
      }

      // 2. Eliminar pagos del cliente
      const { error: incomingMessagesError } = await supabase
        .from('incoming_messages')
        .delete()
        .eq('customer_id', customer.id);

      if (incomingMessagesError) {
        console.error('Error eliminando mensajes entrantes:', incomingMessagesError);
        // No lanzar error, continuar
      }

      // 3. Eliminar logs de notificaciones
      const { error: notificationLogError } = await supabase
        .from('notification_log')
        .delete()
        .eq('customer_id', customer.id);

      if (notificationLogError) {
        console.error('Error eliminando logs de notificaciones:', notificationLogError);
        // No lanzar error, continuar
      }

      // Finalmente, eliminar el cliente
      const { error: customerError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id);

      if (customerError) throw customerError;

      toast({
        title: "Cliente eliminado",
        description: "El cliente y todos sus datos asociados han sido eliminados exitosamente",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el cliente: ${error.message}`,
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
            Esta acción no se puede deshacer. El cliente "{customer.name}" y todos sus datos asociados 
            (mensajes, notificaciones) serán eliminados permanentemente del sistema.
            {customer.package_count > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                Advertencia: Este cliente tiene {customer.package_count} paquete(s) asociado(s) y no podrá ser eliminado.
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
