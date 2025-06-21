// src/lib/savedInsightsUtils.ts
import { useAuthActions } from "@/contexts/authUtils";
import { toast } from "@/hooks/use-toast";
import { saveFeedItem, removeSavedFeedItem } from "@/lib/api";
import { getCurrentUserToken } from "@/lib/firebase";

export const useSavedInsights = () => {
  const { user, requireAuth } = useAuthActions();

  const handleSaveInsightInApi = async (id: string) => {
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
