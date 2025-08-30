
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMarketingContacts } from '@/hooks/useMarketingContacts';
import { Plus, Search, Upload } from 'lucide-react';
import { MarketingContactsTable } from './MarketingContactsTable';
import { AddContactDialog } from './AddContactDialog';
import { ImportContactsDialog } from './ImportContactsDialog';

export function MarketingContacts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const { data: contacts = [], isLoading } = useMarketingContacts(searchTerm);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contactos de Marketing</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowImportDialog(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar contacto
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <MarketingContactsTable contacts={contacts} isLoading={isLoading} />
        </CardContent>
      </Card>

      <AddContactDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
      
      <ImportContactsDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
    </div>
  );
}
