"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Insight } from "@/components/InsightCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ByteCard } from "@/components/ui/bytmecard";
import { useTheme } from "@/contexts/ThemeContext";
import { getSavedFeedItems, removeSavedFeedItem } from "@/lib/api";
import { auth, getCurrentUserToken } from "@/lib/firebase";
import { useAuthActions } from "@/contexts/authUtils";
import { useFollowChannel } from "@/hooks/use-follow";
import { useAuth } from "@/contexts/AuthContext";

const SavedBytes = () => {
      const { token } = useAuth();
  const [savedBytes, setSavedBytes] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
   const { handleGoogleSignIn, user } = useAuthActions();
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadSavedBytes();
      } else {
        setLoading(false);
        setError("Please sign in to view saved items");
      }
    });

    return () => unsubscribe();
  }, []);

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
  
  const handleFollowToggle = async (channelId: string, currentlyFollowed: boolean): Promise<void> => {
    await toggleFollowChannel(channelId, currentlyFollowed);
  };
  

  const loadSavedBytes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await getSavedFeedItems(token);
      
      const formattedBytes: Insight[] = response.saved_feeds.map((item: any) => {
        const sourceUrl = item.metadata?.url || `https://youtube.com/watch?v=${item.video_id}`;
        
        let sourcePlatform: "youtube" | "twitter" | "linkedin" | "other" = "youtube";
        
        if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) {
          sourcePlatform = "youtube";
        } else if (sourceUrl.includes('twitter.com') || sourceUrl.includes('x.com')) {
          sourcePlatform = "twitter";
        } else if (sourceUrl.includes('linkedin.com')) {
          sourcePlatform = "linkedin";
        } else {
          sourcePlatform = "other";
        }
        
        return {
          id: item.video_id,
          title: item.metadata?.title || 'Untitled',
          summary: item.analysis?.summary || '',
          image: item.metadata?.thumbnails?.high?.url || '',
          industry: item.industry || "General",
          influencer: {
            id: item.influencer_id,
            name: item.metadata?.channel_title || 'Unknown Creator',
              channel_id: item.metadata.channel_id,
            profileImage: item.metadata?.thumbnails?.default?.url || '',
            isFollowed: false
          },
          isSaved: true, // All items in saved bytes are saved by definition
          isLiked: false,
          keyPoints: item.analysis?.key_points || [],
          sentiment: item.analysis?.sentiment || 'neutral',
          publishedAt: item.published_at || new Date().toISOString(),
          source: sourcePlatform,
          sourceUrl: sourceUrl
        };
      });

      setSavedBytes(formattedBytes);
    } catch (err) {
      console.error("Error loading saved Bytes:", err);
      setError(err.message || "Failed to load saved items");
      toast({
        title: "Error",
        description: err.message || "Failed to load saved items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInsight = async (id: string) => {
    try {
      const token = await getCurrentUserToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      await removeSavedFeedItem(token, id);
      setSavedBytes(prev => prev.filter(i => i.id !== id));
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center h-64">
            <p>Loading your saved items...</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleGoogleSignIn}>Sign In with Google</Button>
          </div>
        </div>
        <Navigation />
      </div>
    );

  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Saved Bytes</h1>
          {savedBytes.length > 0 && (
            <div className="flex items-center gap-4">
              <Button onClick={loadSavedBytes} variant="outline">
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
                onRemove={handleRemoveInsight}
                
                  isChannelFollowed={isChannelFollowed(insight.influencer.channel_id)}
          isChannelLoading={isChannelLoading(insight.influencer.channel_id)}
          onFollowToggle={handleFollowToggle}
                onClick={handleClick}
                variant="saved"
              />
            ))}
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