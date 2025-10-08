import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, QrCode } from 'lucide-react';
import { CreateBultoDialog } from './CreateBultoDialog';
import { BultosList } from './BultosList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function BultoManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: bultos, refetch } = useQuery({
    queryKey: ['bultos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bultos')
        .select(`
          *,
          trips!bultos_trip_id_fkey(
            id,
            trip_date,
            origin,
            destination
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <CardTitle>Gestión de Bultos</CardTitle>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Bulto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BultosList bultos={bultos || []} onUpdate={refetch} />
        </CardContent>
      </Card>

      <CreateBultoDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetch}
      />
    </div>
  );
}
