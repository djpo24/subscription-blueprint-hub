
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
    countryCode: '+57',
    phoneNumber: '',
    role: 'employee' as 'admin' | 'employee' | 'traveler'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      console.log('🚀 Starting user creation process...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.error('❌ No active session found');
        throw new Error('No tienes una sesión activa. Por favor inicia sesión como administrador.');
      }

      console.log('✅ Session found, calling create-user function...');

      // Prepare user data with full phone number
      const fullPhone = userData.phoneNumber ? `${userData.countryCode}${userData.phoneNumber}` : '';
      const userDataToSend = {
        ...userData,
        phone: fullPhone
      };

      console.log('📤 Sending data to create-user function:', {
        email: userDataToSend.email,
        role: userDataToSend.role,
        phone: userDataToSend.phone
      });

      // Call the Edge Function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: userDataToSend,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Error en la función: ${error.message || 'Error desconocido'}`);
      }

      if (data?.error) {
        console.error('❌ Function returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('✅ User created successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('✅ User creation completed successfully');
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
      if (formData.role === 'traveler') {
        queryClient.invalidateQueries({ queryKey: ['travelers'] });
        queryClient.invalidateQueries({ queryKey: ['available-travelers'] });
      }
      
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        countryCode: '+57',
        phoneNumber: '',
        role: 'employee'
      });
      
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      console.error('❌ Error creating user:', error);
      let errorMessage = "No se pudo crear el usuario";
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = "Este email ya está registrado";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Email inválido";
        } else if (error.message.includes('Insufficient permissions')) {
          errorMessage = "No tienes permisos suficientes para crear usuarios. Asegúrate de estar autenticado como administrador.";
        } else if (error.message.includes('Unauthorized') || error.message.includes('sesión activa')) {
          errorMessage = "Sesión expirada o no válida. Por favor inicia sesión nuevamente como administrador.";
        } else if (error.message.includes('Auth session missing')) {
          errorMessage = "No hay sesión de autenticación. Por favor inicia sesión como administrador.";
        } else {
          errorMessage = error.message;
        }
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
    
    if (!formData.email.trim() || !formData.password.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    console.log('📝 Form submitted, starting user creation...');
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
            {formData.role === 'traveler' && (
              <span className="block mt-1 text-blue-600">
                Se creará automáticamente un registro de viajero vinculado a este usuario.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> Debes estar autenticado como administrador para crear usuarios. 
            Si ves errores de permisos, asegúrate de haber iniciado sesión correctamente.
          </AlertDescription>
        </Alert>
        
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
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <PhoneNumberInput
              label="Teléfono"
              id="phone"
              countryCode={formData.countryCode}
              phoneNumber={formData.phoneNumber}
              onCountryCodeChange={(value) => updateFormData('countryCode', value)}
              onPhoneNumberChange={(value) => updateFormData('phoneNumber', value)}
              placeholder="Número de teléfono"
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
              disabled={createUserMutation.isPending}
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
