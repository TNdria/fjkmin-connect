import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Utilisateur, Adherent } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  utilisateur: Utilisateur | null;
  adherent: Adherent | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  utilisateur: null,
  adherent: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [adherent, setAdherent] = useState<Adherent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Récupérer l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (!userError && userData) {
        setUtilisateur(userData as Utilisateur);
        
        // Si l'utilisateur a un adherent associé, le récupérer
        if (userData.id_adherent) {
          const { data: adherentData, error: adherentError } = await supabase
            .from('adherents')
            .select('*')
            .eq('id_adherent', userData.id_adherent)
            .single();
            
          if (!adherentError && adherentData) {
            setAdherent(adherentData as Adherent);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Defer user data fetching
      if (session?.user) {
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);
      } else {
        setUtilisateur(null);
        setAdherent(null);
      }
      
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUtilisateur(null);
    setAdherent(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, utilisateur, adherent, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};