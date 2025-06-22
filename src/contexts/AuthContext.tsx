
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  getIdToken
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const idToken = await getIdToken(user);
          setToken(idToken);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setToken(null);
        }
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await getIdToken(result.user);
      setToken(idToken);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setToken(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<void> => {
    if (user) {
      try {
        const idToken = await getIdToken(user, true);
        setToken(idToken);
      } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
      }
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await getIdToken(result.user);
      setToken(idToken);
    } catch (error) {
      console.error('Error with Google sign in:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    signInWithGoogle,
    signOut,
    refreshToken,
    handleGoogleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
