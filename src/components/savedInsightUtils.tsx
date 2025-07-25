// src/lib/savedInsightsUtils.ts
import { useAuthActions } from "@/contexts/authUtils";
import { toast } from "@/hooks/use-toast";
import { saveFeedItem, removeSavedFeedItem } from "@/lib/api";
import { getCurrentUserToken } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

export const useSavedInsights = () => {
  const { user, requireAuth } = useAuthActions();
  const navigate = useNavigate();

  const handleSaveInsightInApi = async (id: string) => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to sign-up page
      navigate('/signup', { state: { redirectPath: '/' } });
      return;
    }

    const token = await getCurrentUserToken();
    try {
      await requireAuth(async () => {
        await saveFeedItem(token, id);
        toast({
          title: "Byte saved",
          description: "You can find it in saved tab",
        });
      });
    } catch (error: any) {
      console.error("Error toggling save status:", error);
      
      // Handle the "already saved" case
      if (error.message?.includes("byte is already saved") || 
          error.status === 400) {
        toast({
          title: "Already saved",
          description: "Byte is already saved",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save byte",
          variant: "destructive"
        });
      }
    }
  };

  return {
    handleSaveInsightInApi,
  };
};
