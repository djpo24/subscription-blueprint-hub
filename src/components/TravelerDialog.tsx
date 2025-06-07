
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
    first_name: '',
    last_name: '',
    phone: '',
    user_id: '', // New field for linking to user
    create_new_user: false // Toggle for creating new standalone traveler
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
      // If linking to existing user, use user's data
      if (travelerData.user_id && !travelerData.create_new_user) {
        const selectedUser = availableUsers.find(u => u.user_id === travelerData.user_id);
        if (selectedUser) {
          const { data, error } = await supabase
            .from('travelers')
            .insert({
              user_id: travelerData.user_id,
              first_name: selectedUser.first_name,
              last_name: selectedUser.last_name,
              phone: selectedUser.phone || travelerData.phone
            })
            .select()
            .single();
          
          if (error) throw error;
          return data;
        }
      }

      // Create standalone traveler (without user link)
      const { data, error } = await supabase
        .from('travelers')
        .insert({
          first_name: travelerData.first_name,
          last_name: travelerData.last_name,
          phone: travelerData.phone
        })
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
      queryClient.invalidateQueries({ queryKey: ['available-travelers'] });
      
      // Reset form
      setFormData({ 
        first_name: '', 
        last_name: '', 
        phone: '', 
        user_id: '',
        create_new_user: false
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
    
    // Validation for standalone traveler
    if (formData.create_new_user || !formData.user_id) {
      if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone.trim()) {
        toast({
          title: "Error",
          description: "Todos los campos son obligatorios para crear un viajero independiente",
          variant: "destructive"
        });
        return;
      }
    } else if (!formData.user_id) {
      toast({
        title: "Error",
        description: "Debe seleccionar un usuario o crear un viajero independiente",
        variant: "destructive"
      });
      return;
    }

    createTravelerMutation.mutate(formData);
  };

  const updateFormData = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedUser = availableUsers.find(u => u.user_id === formData.user_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Viajero</DialogTitle>
          <DialogDescription>
            Crea un nuevo viajero asignándolo a un usuario existente o como registro independiente.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create_new_user"
                checked={formData.create_new_user}
                onChange={(e) => updateFormData('create_new_user', e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="create_new_user" className="text-sm">
                Crear viajero independiente (sin vincular a usuario del sistema)
              </Label>
            </div>

            {!formData.create_new_user && (
              <div className="space-y-2">
                <Label htmlFor="user_id">Usuario con rol de viajero</Label>
                <Select 
                  value={formData.user_id} 
                  onValueChange={(value) => updateFormData('user_id', value)}
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
            )}

            {(formData.create_new_user || !selectedUser) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateFormData('first_name', e.target.value)}
                    placeholder="Nombre del viajero"
                    required={formData.create_new_user || !formData.user_id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateFormData('last_name', e.target.value)}
                    placeholder="Apellido del viajero"
                    required={formData.create_new_user || !formData.user_id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+57 300 123 4567"
                    required={formData.create_new_user || !formData.user_id}
                  />
                </div>
              </>
            )}

            {selectedUser && !formData.create_new_user && (
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
