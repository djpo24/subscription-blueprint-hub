
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onSuccess }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'employee' as 'admin' | 'employee' | 'traveler'
  });

  const { toast } = useToast();

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone || null,
          role: userData.role,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (profileError) throw profileError;

      return authData;
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'employee'
      });
      
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    createUserMutation.mutate(formData);
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo usuario del sistema.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => updateFormData('first_name', e.target.value)}
                placeholder="Nombre"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => updateFormData('last_name', e.target.value)}
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              placeholder="email@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="Contraseña temporal"
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol *</Label>
            <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="employee">Empleado</SelectItem>
                <SelectItem value="traveler">Viajero</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
