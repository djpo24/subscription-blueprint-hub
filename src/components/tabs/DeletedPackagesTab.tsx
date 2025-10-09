import React from 'react';
import { DeletedPackagesPanel } from '@/components/admin/DeletedPackagesPanel';

export function DeletedPackagesTab() {
  return (
    <div className="space-y-4">
      <DeletedPackagesPanel />
    </div>
  );
}
