
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // Delete tracking events first
      await supabase
        .from('tracking_events')
        .delete()
        .eq('package_id', pkg.id);

      // Delete the package
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', pkg.id);

      if (error) throw error;

      toast({
        title: "Encomienda eliminada",
        description: "La encomienda ha sido eliminada correctamente"
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
              Esta acción eliminará permanentemente la encomienda {pkg.tracking_number}. 
              Esta acción no se puede deshacer.
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
