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
          await saveFeedItem(token,id);
          toast({
            title: "Saved",
            description: "Added to your saved collection",
          });

      });
    } catch (error) {
      console.error("Error toggling save status:", error);

    }
  };

  return {
    handleSaveInsightInApi,
  };
};