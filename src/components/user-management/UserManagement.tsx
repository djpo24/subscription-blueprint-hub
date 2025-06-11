
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Package } from 'lucide-react';
import { UsersList } from './UsersList';
import { CreateUserDialog } from './CreateUserDialog';
import { BulkUserCreationDialog } from './BulkUserCreationDialog';
import { BulkPackageCreationDialog } from './BulkPackageCreationDialog';
import { useUserProfiles } from '@/hooks/useUserProfiles';

export function UserManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkCreateDialog, setShowBulkCreateDialog] = useState(false);
  const [showBulkPackageDialog, setShowBulkPackageDialog] = useState(false);
  const { data: users, isLoading, refetch } = useUserProfiles();

  const handleUserCreated = () => {
    setShowCreateDialog(false);
    setShowBulkCreateDialog(false);
    refetch();
  };

  const handlePackagesCreated = () => {
    setShowBulkPackageDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios del Sistema</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setShowBulkPackageDialog(true)} variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Importar Encomiendas
              </Button>
              <Button onClick={() => setShowBulkCreateDialog(true)} variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Crear Clientes Masivamente
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UsersList users={users || []} isLoading={isLoading} onUpdate={refetch} />
        </CardContent>
      </Card>

      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleUserCreated}
      />

      <BulkUserCreationDialog
        open={showBulkCreateDialog}
        onOpenChange={setShowBulkCreateDialog}
        onSuccess={handleUserCreated}
      />

      <BulkPackageCreationDialog
        open={showBulkPackageDialog}
        onOpenChange={setShowBulkPackageDialog}
        onSuccess={handlePackagesCreated}
      />
    </>
  );
}
