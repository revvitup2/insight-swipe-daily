
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from './AuthContext';

export const handleGoogleSignIn = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const getUserDisplayInfo = (user: User | null) => {
  if (!user) return { displayName: null, email: null };
  return {
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email
  };
};

export const useAuthActions = () => {
  const { user, signInWithGoogle, signOut, requireAuth } = useAuth();
  
  return {
    user,
    signInWithGoogle,
    signOut,
    requireAuth,
    handleGoogleSignIn: signInWithGoogle,
    handleSignOut: signOut,
  };
};
