
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, CheckCircle } from 'lucide-react';

export function AdminSetupCard() {
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState({
    email: 'djpo24@gmail.com',
    password: 'Dela881224',
    firstName: 'Didier',
    lastName: 'Pedroza',
    phone: '+573014940399'
  });
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsCreating(true);

    try {
      // First, create the admin user using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        throw new Error(`Error creating auth user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // Create the user profile with admin role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: 'admin',
          is_active: true
        });

      if (profileError) {
        throw new Error(`Error creating user profile: ${profileError.message}`);
      }

      setIsComplete(true);
      toast({
        title: "¡Administrador creado exitosamente!",
        description: `El usuario administrador ${formData.email} ha sido creado. Ahora puedes iniciar sesión.`,
      });

    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error al crear administrador",
        description: error.message || "Hubo un problema al crear el usuario administrador",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">¡Administrador Creado!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            El usuario administrador ha sido creado exitosamente.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium">Credenciales de acceso:</p>
            <p className="text-sm text-gray-600">Email: {formData.email}</p>
            <p className="text-sm text-gray-600">Contraseña: {formData.password}</p>
          </div>
          <Button 
            onClick={() => window.location.href = '/auth'} 
            className="w-full"
          >
            Ir a Iniciar Sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Crear Administrador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={isCreating}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            disabled={isCreating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              disabled={isCreating}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            disabled={isCreating}
          />
        </div>

        <Button 
          onClick={handleCreateAdmin}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCreating ? "Creando Administrador..." : "Crear Administrador"}
        </Button>
      </CardContent>
    </Card>
  );
}
