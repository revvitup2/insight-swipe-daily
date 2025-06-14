// src/lib/authUtils.ts
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthActions = () => {
  const { handleGoogleSignIn, handleSignOut, user } = useAuth();

  const enhancedHandleGoogleSignIn = async () => {
    try {
      const user = await handleGoogleSignIn();
      toast({
        title: "Welcome!",
        description: `Signed in as ${user.displayName || user.email}`,
      });
      return user;
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
      await handleSignOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out",
      });
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
    handleGoogleSignIn: enhancedHandleGoogleSignIn,
    handleSignOut: enhancedHandleSignOut,
    requireAuth,
    user,
  };
};