import { TabsContent } from '@/components/ui/tabs';
import { UserManagement } from '@/components/user-management/UserManagement';
import { CreateAdminUserButton } from '@/components/admin/CreateAdminUserButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function UsersTab() {
  return <TabsContent value="users" className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra usuarios, empleados y viajeros del sistema
          </p>
        </div>

        
        
        <UserManagement />
      </div>
    </TabsContent>;
}