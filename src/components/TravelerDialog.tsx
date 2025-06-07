
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfiles } from '@/hooks/useUserProfiles';

interface TravelerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (travelerId: string) => void;
}

export function TravelerDialog({ open, onOpenChange, onSuccess }: TravelerDialogProps) {
  const [formData, setFormData] = useState({
    user_id: '',
    phone: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: userProfiles = [] } = useUserProfiles();

  // Filter users with traveler role who don't have a traveler record yet
  const availableUsers = userProfiles.filter(profile => 
    profile.role === 'traveler' && profile.is_active
  );

  const createTravelerMutation = useMutation({
    mutationFn: async (travelerData: typeof formData) => {
      if (!travelerData.user_id) {
        throw new Error('Debe seleccionar un usuario');
      }

      const selectedUser = availableUsers.find(u => u.user_id === travelerData.user_id);
      if (!selectedUser) {
        throw new Error('Usuario no encontrado');
      }

      const { data, error } = await supabase
        .from('travelers')
        .insert({
          user_id: travelerData.user_id,
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          phone: travelerData.phone || selectedUser.phone || ''
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Viajero creado",
        description: "El viajero ha sido vinculado exitosamente",
      });
      
      queryClient.invalidateQueries({ queryKey: ['travelers'] });
      queryClient.invalidateQueries({ queryKey: ['available-travelers'] });
      
      // Reset form
      setFormData({ 
        user_id: '',
        phone: ''
      });
      onSuccess(data.id);
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error creating traveler:', error);
      let errorMessage = "No se pudo crear el viajero. Por favor intente nuevamente.";
      
      if (error.code === '23505') {
        errorMessage = "Este usuario ya tiene un registro de viajero asociado.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id) {
      toast({
        title: "Error",
        description: "Debe seleccionar un usuario",
        variant: "destructive"
      });
      return;
    }

    createTravelerMutation.mutate(formData);
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedUser = availableUsers.find(u => u.user_id === formData.user_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Viajero</DialogTitle>
          <DialogDescription>
            Vincula un usuario existente con rol de viajero para crear un nuevo registro de viajero.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">Usuario con rol de viajero *</Label>
              <Select 
                value={formData.user_id} 
                onValueChange={(value) => updateFormData('user_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario viajero" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} - {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableUsers.length === 0 && (
                <p className="text-sm text-gray-500">
                  No hay usuarios con rol de viajero disponibles
                </p>
              )}
            </div>

            {selectedUser && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h4 className="font-medium text-gray-900">Datos del usuario seleccionado:</h4>
                <p className="text-sm text-gray-600">
                  <strong>Nombre:</strong> {selectedUser.first_name} {selectedUser.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Teléfono:</strong> {selectedUser.phone || 'No especificado'}
                </p>
                {!selectedUser.phone && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="phone">Teléfono (requerido)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="+57 300 123 4567"
                      required
                    />
                  </div>
                )}
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
