import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateBultoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preSelectedTripId?: string;
}

export function CreateBultoDialog({ open, onOpenChange, onSuccess, preSelectedTripId }: CreateBultoDialogProps) {
  const [selectedTripId, setSelectedTripId] = useState<string>(preSelectedTripId || '');
  const [notes, setNotes] = useState('');
  const [nextBultoNumber, setNextBultoNumber] = useState<number>(1);
  const [bultoQuantity, setBultoQuantity] = useState<number>(1);

  // Initialize selectedTripId from preSelectedTripId
  useEffect(() => {
    if (preSelectedTripId) {
      setSelectedTripId(preSelectedTripId);
    }
  }, [preSelectedTripId]);

  const { data: trips } = useQuery({
    queryKey: ['trips-for-bulto'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .in('status', ['scheduled', 'pending'])
        .order('trip_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });


  // Get next bulto number when trip is selected
  useEffect(() => {
    if (selectedTripId) {
      supabase
        .from('bultos')
        .select('bulto_number')
        .eq('trip_id', selectedTripId)
        .order('bulto_number', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          const maxNumber = data?.[0]?.bulto_number || 0;
          setNextBultoNumber(maxNumber + 1);
        });
    }
  }, [selectedTripId]);

  const createBultoMutation = useMutation({
    mutationFn: async () => {
      // Create new bultos
      const bultosToCreate = [];
      for (let i = 0; i < bultoQuantity; i++) {
        bultosToCreate.push({
          trip_id: selectedTripId,
          bulto_number: nextBultoNumber + i,
          notes: i === 0 ? notes : '',
          total_packages: 0,
          status: 'open'
        });
      }

      const { data: bultos, error: bultoError } = await supabase
        .from('bultos')
        .insert(bultosToCreate)
        .select();

      if (bultoError) throw bultoError;

      return bultos;
    },
    onSuccess: () => {
      toast.success(`${bultoQuantity} bulto(s) creado(s) exitosamente`);
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error('Error processing bulto:', error);
      toast.error('Error al procesar bulto');
    }
  });

  const handleClose = () => {
    setSelectedTripId('');
    setNotes('');
    setBultoQuantity(1);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevos Bultos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!preSelectedTripId && (
            <div className="space-y-2">
              <Label>Viaje</Label>
              <Select value={selectedTripId} onValueChange={setSelectedTripId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un viaje" />
                </SelectTrigger>
                <SelectContent>
                  {trips?.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.origin} → {trip.destination} - {new Date(trip.trip_date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedTripId && (
            <>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Próximo número de bulto: #{nextBultoNumber}</p>
              </div>

              <div className="space-y-2">
                <Label>¿Cuántos bultos deseas crear?</Label>
                <input
                  type="number"
                  min="1"
                  value={bultoQuantity}
                  onChange={(e) => setBultoQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Se crearán {bultoQuantity} bulto(s) vacíos comenzando desde el #{nextBultoNumber}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas para el primer bulto..."
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createBultoMutation.mutate()}
                  disabled={createBultoMutation.isPending}
                  className="flex-1"
                >
                  {createBultoMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Crear {bultoQuantity} Bulto(s)
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
