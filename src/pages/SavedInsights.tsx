"use client";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Insight } from "@/components/InsightCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ByteCard } from "@/components/ui/bytmecard";
import { useTheme } from "@/contexts/ThemeContext";
import { removeSavedFeedItem } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { useAuthActions } from "@/contexts/authUtils";
import { useFollowChannel } from "@/hooks/use-follow";
import { useAuth } from "@/contexts/AuthContext";
import { usePaginatedSavedFeeds } from "@/hooks/use-paginated-saved-feeds";
import SignUp from "@/components/SignUpComponent";

const SavedBytes = () => {
  const { token } = useAuth();
  const { 
    feed: savedBytes, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    loadMore,
    refresh,
    removeItem
  } = usePaginatedSavedFeeds(token);
  
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { handleGoogleSignIn } = useAuthActions();
  const [isHandlingLoadMore, setIsHandlingLoadMore] = useState(false);
  
  const {
    followedChannels,
    toggleFollowChannel,
    isChannelFollowed,
    isChannelLoading,
    initializeFollowedChannels,
  } = useFollowChannel(token);
  
  useEffect(() => {
    if (token) {
      initializeFollowedChannels();
    }
  }, [token, initializeFollowedChannels]);

  // Infinite scroll effect - similar to your main file
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || isHandlingLoadMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom) {
        setIsHandlingLoadMore(true);
        loadMore().finally(() => setIsHandlingLoadMore(false));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, isLoadingMore, loadMore, isHandlingLoadMore]);

  const handleFollowToggle = async (channelId: string, currentlyFollowed: boolean): Promise<void> => {
    await toggleFollowChannel(channelId, currentlyFollowed);
  };
  
  const handleRemoveInsight = async (id: string,industry?: string) => {
    try {
      if (!token) {
        throw new Error("Authentication required");
      }

      await removeSavedFeedItem(token, id,industry);
      removeItem(id);
      
      toast({
        title: "Removed from saved",
        description: "This byte has been removed from your collection",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleClick = (id: string) => {
    navigate(`/bytes/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3">Loading your saved items...</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6">
          <SignUp/>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Saved Bytes</h1>
          {savedBytes.length > 0 && (
            <div className="flex items-center gap-4">
              <Button onClick={refresh} variant="outline" disabled={isLoading || isLoadingMore}>
                Refresh
              </Button>
            </div>
          )}
        </div>
        
        {savedBytes.length > 0 ? (
          <div className="space-y-6">
            {savedBytes.map(insight => (
              <ByteCard
                key={insight.id}
                bite={insight}
                isDarkMode={isDarkMode}
                onRemove={()=>{handleRemoveInsight(insight.id,insight.industry)}}
                isChannelFollowed={isChannelFollowed(insight.influencer.channel_id)}
                isChannelLoading={isChannelLoading(insight.influencer.channel_id)}
                onFollowToggle={handleFollowToggle}
                onClick={handleClick}
                variant="saved"
              />
            ))}
            
            {/* Loading more indicator - similar to your main file */}
            {(isLoadingMore || isHandlingLoadMore) && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* No more content message - similar to your main file */}
            {!hasMore && !isLoading && savedBytes.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                You've reached the end of your saved items
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No saved items yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              When you save interesting Bytes, they'll appear here
            </p>
            <Button onClick={() => navigate("/")}>
              Browse Bytes
            </Button>
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
};

export default SavedBytes;