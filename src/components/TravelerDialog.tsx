
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TravelerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (travelerId: string) => void;
}

export function TravelerDialog({ open, onOpenChange, onSuccess }: TravelerDialogProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTravelerMutation = useMutation({
    mutationFn: async (travelerData: typeof formData) => {
      const { data, error } = await supabase
        .from('travelers')
        .insert(travelerData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Viajero creado",
        description: "El viajero ha sido creado exitosamente",
      });
      
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
      
      // Reset form
      setFormData({ first_name: '', last_name: '', phone: '' });
      onSuccess(data.id);
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error creating traveler:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el viajero. Por favor intente nuevamente.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive"
      });
      return;
    }

    createTravelerMutation.mutate(formData);
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nuevo Viajero</DialogTitle>
          <DialogDescription>
            Crea un nuevo viajero para asignar al viaje.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => updateFormData('first_name', e.target.value)}
              placeholder="Nombre del viajero"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Apellido</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => updateFormData('last_name', e.target.value)}
              placeholder="Apellido del viajero"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              placeholder="+57 300 123 4567"
              required
            />
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
              type="submit" 
              disabled={createTravelerMutation.isPending}
            >
              {createTravelerMutation.isPending ? 'Creando...' : 'Crear Viajero'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
