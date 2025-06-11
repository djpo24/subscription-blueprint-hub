
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteDispatch } from '@/hooks/useDeleteDispatch';

interface DeleteDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: string | null;
  dispatchDate: string;
}

export function DeleteDispatchDialog({ 
  open, 
  onOpenChange, 
  dispatchId, 
  dispatchDate 
}: DeleteDispatchDialogProps) {
  const deleteDispatch = useDeleteDispatch();

  const handleDelete = () => {
    if (dispatchId) {
      deleteDispatch.mutate(dispatchId, {
        onSuccess: () => {
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar despacho?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el despacho del {dispatchDate} y todos sus paquetes asociados.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteDispatch.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteDispatch.isPending ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
