
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('AppRoutes - user:', user, 'loading:', loading);
  }, [user, loading]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Si no hay usuario, mostrar página de auth */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <Auth />} 
      />
      
      {/* Página principal protegida */}
      <Route 
        path="/" 
        element={
          user ? (
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
      
      {/* Cualquier otra ruta */}
      <Route 
        path="*" 
        element={
          user ? (
            <NotFound />
          ) : (
            <Navigate to="/auth" replace />
          )
        } 
      />
    </Routes>
  );
}

const App = () => {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-white">
            <Toaster />
            <Sonner />
            <HashRouter>
              <AppRoutes />
            </HashRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
