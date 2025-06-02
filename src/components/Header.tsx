
import { Package, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchTerm, onSearchChange }: HeaderProps) {
  return (
    <header className="uber-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          <div className="flex items-center">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2 sm:mr-3" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              <span className="hidden sm:inline">Envíos Ojitos</span>
              <span className="sm:hidden">Ojitos</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-40 sm:w-48 lg:w-64 uber-input text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
