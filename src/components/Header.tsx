
import { Search, LogOut, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchTerm, onSearchChange }: HeaderProps) {
  const { signOut, user, loading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    if (loading) return; // Prevent multiple clicks
    
    try {
      console.log('Header: Starting sign out process');
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      console.error('Header: Sign out error:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="uber-header sticky top-0 z-10">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {isMobile && (
              <SidebarTrigger className="bg-white text-black hover:bg-gray-100 hover:text-black rounded-full h-8 w-8 flex-shrink-0" />
            )}
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
              {isMobile ? "Ojitos" : "Envíos Ojitos"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-sm sm:max-w-md">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
              <Input
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar encomiendas..."}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 sm:pl-10 bg-white text-sm h-8 sm:h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {!isMobile && (
              <span className="text-xs sm:text-sm text-gray-300 hidden lg:block truncate max-w-32">
                {user?.email}
              </span>
            )}
            <Button
              variant="secondary"
              size={isMobile ? "sm" : "sm"}
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              {!isMobile && <span className="hidden sm:inline text-sm">
                {loading ? "Cerrando..." : "Salir"}
              </span>}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
