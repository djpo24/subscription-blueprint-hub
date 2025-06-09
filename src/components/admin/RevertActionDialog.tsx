
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Undo2 } from 'lucide-react';
import { UserActivity } from './types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RevertActionDialogProps {
  activity: UserActivity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevertSuccess: () => void;
}

export function RevertActionDialog({ activity, open, onOpenChange, onRevertSuccess }: RevertActionDialogProps) {
  const [isReverting, setIsReverting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRevert = async () => {
    if (!activity || !user) return;

    setIsReverting(true);
    try {
      console.log('Reverting action:', activity.id);

      const { error } = await supabase.rpc('revert_user_action', {
        p_action_id: activity.id,
        p_reverted_by: user.id
      });

      if (error) {
        console.error('Error reverting action:', error);
        throw error;
      }

      toast({
        title: "Acción revertida",
        description: "La acción ha sido revertida exitosamente",
      });

      onRevertSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error reverting action:', error);
      toast({
        title: "Error",
        description: "No se pudo revertir la acción. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsReverting(false);
    }
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="h-5 w-5" />
            Revertir Acción
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro que deseas revertir esta acción? Esta operación no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-800">
                  Detalles de la acción a revertir:
                </p>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Usuario:</strong> {activity.user_name}</p>
                  <p><strong>Tipo:</strong> {activity.activity_type}</p>
                  <p><strong>Descripción:</strong> {activity.description}</p>
                  <p><strong>Fecha:</strong> {new Date(activity.created_at).toLocaleString('es-ES')}</p>
                </div>
              </div>
            </div>
          </div>

          {activity.old_values && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium mb-2">Valores anteriores:</p>
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(activity.old_values, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isReverting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRevert}
            disabled={isReverting || !activity.can_revert || activity.reverted_at}
            className="bg-red-600 hover:bg-red-700"
          >
            {isReverting ? "Revirtiendo..." : "Revertir Acción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
