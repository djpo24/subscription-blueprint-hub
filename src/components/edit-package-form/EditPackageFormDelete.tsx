
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';

interface Package {
  id: string;
  tracking_number: string;
}

interface EditPackageFormDeleteProps {
  package: Package;
  onSuccess: () => void;
}

export function EditPackageFormDelete({ package: pkg, onSuccess }: EditPackageFormDeleteProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // Use soft delete function
      const { data, error } = await supabase.rpc('soft_delete_package', {
        package_id: pkg.id
      });

      if (error) throw error;

      // Invalidar todas las queries relevantes para actualizar la UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['packages'] }),
        queryClient.invalidateQueries({ queryKey: ['packages-by-date'] }),
        queryClient.invalidateQueries({ queryKey: ['packages-by-trip'] }),
        queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] }),
        queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] }),
        queryClient.invalidateQueries({ queryKey: ['deleted-packages'] })
      ]);

      toast({
        title: "Encomienda eliminada",
        description: "La encomienda ha sido movida a la papelera y puede ser recuperada desde 'Paquetes Eliminados'"
      });

      setShowDeleteDialog(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la encomienda",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={() => setShowDeleteDialog(true)}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la encomienda {pkg.tracking_number} como eliminada. 
              Los administradores podrán recuperarla si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
