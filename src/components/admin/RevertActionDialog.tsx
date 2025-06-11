
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserActivity } from './types';

interface RevertActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: UserActivity | null;
}

export function RevertActionDialog({ open, onOpenChange, activity }: RevertActionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const revertMutation = useMutation({
    mutationFn: async () => {
      if (!activity) throw new Error('No activity selected');

      const { error } = await supabase.rpc('revert_user_action', {
        action_id: activity.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Acción revertida",
        description: "La acción ha sido revertida exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['user-activities'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error reverting action:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo revertir la acción",
        variant: "destructive"
      });
    }
  });

  const handleRevert = () => {
    revertMutation.mutate();
  };

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Revertir Acción</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres revertir esta acción? Esta operación intentará deshacer los cambios realizados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{activity.activity_type}</Badge>
              <span className="text-sm text-gray-500">
                {new Date(activity.created_at).toLocaleString()}
              </span>
            </div>
            <p><strong>Usuario:</strong> {activity.user_name}</p>
            <p><strong>Descripción:</strong> {activity.description}</p>
            {activity.table_name && (
              <p><strong>Tabla:</strong> {activity.table_name}</p>
            )}
          </div>

          {activity.old_values && (
            <div className="space-y-2">
              <h4 className="font-medium">Valores anteriores:</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(activity.old_values, null, 2)}
              </pre>
            </div>
          )}

          {activity.new_values && (
            <div className="space-y-2">
              <h4 className="font-medium">Valores nuevos:</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {JSON.stringify(activity.new_values, null, 2)}
              </pre>
            </div>
          )}
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
            onClick={handleRevert}
            disabled={revertMutation.isPending || !activity.can_revert}
          >
            {revertMutation.isPending ? 'Revirtiendo...' : 'Revertir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
