// src/lib/authUtils.ts
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthActions = () => {
  const { signInWithGoogle, signOut, user } = useAuth();
const navigate = useNavigate();
  const enhancedHandleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: `Signed in successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
      throw error;
    }
  };

  const enhancedHandleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    }
  };

  const requireAuth = async (action: () => Promise<void>) => {
    if (!user) {
      try {
        await enhancedHandleGoogleSignIn();
        await action();
      } catch (error) {
        console.error("Authentication or action failed:", error);
      }
    } else {
      await action();
    }
  };

  return {
    user,
    signInWithGoogle,
    signOut,
    requireAuth,
    handleGoogleSignIn: enhancedHandleGoogleSignIn,
    handleSignOut: enhancedHandleSignOut,
  };
};