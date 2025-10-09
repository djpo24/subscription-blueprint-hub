import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDeleteBulto() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteBulto = async (bultoId: string) => {
    setIsDeleting(true);
    try {
      // First, unassign all packages from this bulto
      const { error: updateError } = await supabase
        .from('packages')
        .update({ bulto_id: null })
        .eq('bulto_id', bultoId);

      if (updateError) throw updateError;

      // Delete all package labels associated with this bulto
      const { error: labelsError } = await supabase
        .from('package_labels')
        .delete()
        .eq('bulto_id', bultoId);

      if (labelsError) throw labelsError;

      // Finally, delete the bulto
      const { error: deleteError } = await supabase
        .from('bultos')
        .delete()
        .eq('id', bultoId);

      if (deleteError) throw deleteError;

      toast.success('Bulto eliminado exitosamente');
      return true;
    } catch (error) {
      console.error('Error deleting bulto:', error);
      toast.error('Error al eliminar el bulto');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteBulto, isDeleting };
}
