
import { Button } from '@/components/ui/button';
import { Shield, Loader2, UserCheck } from 'lucide-react';
import { useCreateAdminUser } from '@/hooks/useCreateAdminUser';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function CreateAdminUserButton() {
  const createAdminMutation = useCreateAdminUser();
  const { toast } = useToast();

  const handleCreateAdmin = () => {
    createAdminMutation.mutate({
      email: 'djpo24@gmail.com',
      password: 'Dela881224',
      first_name: 'Didier',
      last_name: 'Pedroza',
      phone: '+573014940399',
      role: 'admin'
    });
  };

  const handleCompleteSetup = () => {
    toast({
      title: "Usuario Administrador - Configuración Completa",
      description: "El usuario administrador ha sido creado. Ahora puedes registrarte con el email djpo24@gmail.com y contraseña Dela881224 para completar la configuración.",
      duration: 10000,
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <UserCheck className="h-5 w-5" />
          Usuario Administrador Configurado
        </CardTitle>
        <CardDescription>
          El usuario administrador temporal ha sido creado exitosamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium text-green-800 mb-2">✅ Configuración Completada</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> djpo24@gmail.com</p>
            <p><strong>Rol:</strong> Administrador</p>
            <p><strong>Estado:</strong> Activo y listo para usar</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-800 mb-2">📋 Próximos Pasos</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>1. Ve a la página de inicio de sesión</p>
            <p>2. Regístrate usando el email: <code className="bg-white px-1 rounded">djpo24@gmail.com</code></p>
            <p>3. Usa la contraseña: <code className="bg-white px-1 rounded">Dela881224</code></p>
            <p>4. Una vez autenticado, podrás crear usuarios y gestionar el sistema</p>
          </div>
        </div>

        <Button 
          onClick={handleCompleteSetup}
          className="w-full bg-blue-600 hover:bg-blue-700"
          variant="default"
        >
          <Shield className="h-4 w-4 mr-2" />
          Entendido - Ir a Configurar Autenticación
        </Button>
      </CardContent>
    </Card>
  );
}
