
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EditUserDialog } from './EditUserDialog';
import { DeleteUserDialog } from './DeleteUserDialog';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'admin' | 'employee' | 'traveler';
  is_active: boolean;
  created_at: string;
}

interface UsersListProps {
  users: UserProfile[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function UsersList({ users, isLoading, onUpdate }: UsersListProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'employee':
        return 'default';
      case 'traveler':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'employee':
        return 'Empleado';
      case 'traveler':
        return 'Viajero';
      default:
        return role;
    }
  };

  const handleEdit = (user: UserProfile) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleDelete = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    setSelectedUser(null);
    onUpdate();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedUser(null);
    onUpdate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || '-'}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={selectedUser}
        onSuccess={handleEditSuccess}
      />

      <DeleteUserDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={selectedUser}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
