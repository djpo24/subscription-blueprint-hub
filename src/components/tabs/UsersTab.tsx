
import React from 'react';
import { UserManagement } from '@/components/user-management/UserManagement';
import { CreateAdminUserButton } from '@/components/admin/CreateAdminUserButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UsersTab() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra usuarios del sistema y crea clientes masivamente
          </p>
        </div>
        
        <UserManagement />
      </div>
    </div>
  );
}
