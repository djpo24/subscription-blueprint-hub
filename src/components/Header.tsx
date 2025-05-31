
import { Package, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewPackageClick: () => void;
}

export function Header({ searchTerm, onSearchChange, onNewPackageClick }: HeaderProps) {
  return (
    <header className="uber-header">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">Envíos Ojitos</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar encomienda..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64 uber-input"
              />
            </div>
            <Button onClick={onNewPackageClick} className="uber-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Encomienda
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
