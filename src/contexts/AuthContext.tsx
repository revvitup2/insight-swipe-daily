// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Smartlook from 'smartlook-client';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  refreshToken: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: null,
  refreshToken: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = async () => {
    if (user) {
      try {
        const newToken = await user.getIdToken(true);
        setToken(newToken);
      } catch (error) {
        console.error("Error refreshing token:", error);
        setToken(null);
        throw error;
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

        const firebaseToken = await result.user.getIdToken();
    
    // Send to your backend for verification
    const backendResponse = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: firebaseToken }),
    });

    if (!backendResponse.ok) {
      throw new Error('Backend authentication failed');
    }

    const backendData = await backendResponse.json();

      await refreshToken();
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      setUser(null);
      setToken(null);
  
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const newToken = await firebaseUser.getIdToken();
          setToken(newToken);

          Smartlook.identify('USER_ID', {
  name: firebaseUser.displayName,
  email: firebaseUser.email,
});
        } catch (error) {
          console.error("Error getting token:", error);
          setToken(null);
        }
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    const interval = setInterval(async () => {
      if (user) await refreshToken();
    }, 30 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      token, 
      refreshToken,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);