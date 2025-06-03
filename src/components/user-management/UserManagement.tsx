
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UsersList } from './UsersList';
import { CreateUserDialog } from './CreateUserDialog';
import { useUserProfiles } from '@/hooks/useUserProfiles';

export function UserManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: users, isLoading, refetch } = useUserProfiles();

  const handleUserCreated = () => {
    setShowCreateDialog(false);
    refetch();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios del Sistema</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
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
    </>
  );
}
