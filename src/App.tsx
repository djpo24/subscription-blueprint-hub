
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainTabs } from '@/components/MainTabs';
import Auth from '@/pages/Auth';
import Setup from '@/pages/Setup';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        console.log('Checking for existing admin users...');
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('role', 'admin')
          .eq('is_active', true)
          .limit(1);

        if (error) {
          console.error('Error checking for admin:', error);
          setHasAdmin(false);
        } else {
          const adminExists = data && data.length > 0;
          console.log('Admin check result:', adminExists ? 'Admin found' : 'No admin found');
          setHasAdmin(adminExists);
        }
      } catch (error) {
        console.error('Exception checking for admin:', error);
        setHasAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkForAdmin();
  }, []);

  // Show loading while checking for admin or auth
  if (checkingAdmin || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  // If no admin exists, show setup page
  if (hasAdmin === false) {
    return <Setup />;
  }

  // If user is not authenticated, show auth page
  if (!user) {
    return <Auth />;
  }

  // User is authenticated, show main app
  return (
    <SidebarProvider>
      <ProtectedRoute>
        <MainTabs />
      </ProtectedRoute>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
