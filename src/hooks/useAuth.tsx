
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 Setting up auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
        
        // Immediate state update
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle sign out event specifically
        if (event === 'SIGNED_OUT') {
          console.log('✅ User signed out successfully');
          // Force clear all auth state
          setSession(null);
          setUser(null);
          setLoading(false);
          
          // Clear any cached data
          localStorage.removeItem('supabase.auth.token');
          
          // Force redirect to auth page
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email || 'no session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('📝 Attempting to sign in with:', email);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      setLoading(false);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('📝 Attempting to sign up with:', email);
    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('❌ Sign up error:', error);
      setLoading(false);
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Starting sign out process...');
    
    try {
      // Immediately clear local state to prevent UI confusion
      setLoading(true);
      setSession(null);
      setUser(null);
      
      // Clear any cached auth data
      localStorage.removeItem('supabase.auth.token');
      
      console.log('🧹 Cleared local auth state');
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Only clear local session, don't revoke all sessions
      });
      
      if (error) {
        console.warn('⚠️ Supabase sign out warning (but continuing):', error.message);
      } else {
        console.log('✅ Supabase sign out successful');
      }
      
      // Force redirect regardless of Supabase response
      console.log('🔄 Redirecting to home page...');
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Sign out exception:', error);
      
      // Even if there's an error, clear local state and redirect
      setSession(null);
      setUser(null);
      setLoading(false);
      localStorage.removeItem('supabase.auth.token');
      
      // Force redirect anyway
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
