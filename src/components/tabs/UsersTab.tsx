
import { TabsContent } from '@/components/ui/tabs';
import { UserManagement } from '@/components/user-management/UserManagement';
import { CreateAdminUserButton } from '@/components/admin/CreateAdminUserButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function UsersTab() {
  const { user } = useAuth();

  return (
    <TabsContent value="users" className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra usuarios, empleados y viajeros del sistema
          </p>
        </div>

        {!user && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuración Inicial Completada:</strong> El usuario administrador ha sido creado. 
              Ahora necesitas autenticarte para acceder a todas las funcionalidades del sistema.
              <br />
              <span className="text-sm text-muted-foreground mt-1 block">
                Usa el email "djpo24@gmail.com" y contraseña "Dela881224" para iniciar sesión.
              </span>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Configuración Inicial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Estado del Usuario Administrador</h3>
                <p className="text-sm text-muted-foreground">
                  El usuario administrador ha sido configurado correctamente
                </p>
              </div>
              <CreateAdminUserButton />
            </div>
          </CardContent>
        </Card>
        
        <UserManagement />
      </div>
    </TabsContent>
  );
}
