// hooks/useFollowChannel.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface FollowChannelResponse {
  status: string;
  message?: string;
}

interface FollowedChannelsResponse {
  status: string;
  followed_channels: string[];
  count: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useFollowChannel = (token: string | null) => {
  const [followedChannels, setFollowedChannels] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize followed channels when token changes or when manually refreshed
  const initializeFollowedChannels = useCallback(async () => {
    if (!token) {
      setFollowedChannels(new Set());
      setIsInitialized(true);
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, __global: true }));
      const response = await fetch(`${API_BASE_URL}/user/followed-channels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: FollowedChannelsResponse = await response.json();
        setFollowedChannels(new Set(data.followed_channels));
      } else {
        console.error('Failed to fetch followed channels:', response.status);
        throw new Error('Failed to fetch followed channels');
      }
    } catch (error) {
      console.error('Failed to fetch followed channels:', error);
      toast({
        title: "Error",
        description: "Failed to load followed channels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, __global: false }));
      setIsInitialized(true);
    }
  }, [token]);

  // Load followed channels when token changes or refresh is triggered
  useEffect(() => {
    initializeFollowedChannels();
  }, [initializeFollowedChannels, refreshTrigger]);

  // Function to manually refresh followed channels
  const refreshFollowedChannels = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Toggle follow/unfollow
  const toggleFollowChannel = useCallback(async (channelId: string, currentlyFollowed: boolean) => {
    if (!token) {
      toast({
        title: "Error",
        description: "You need to be logged in to follow channels",
        variant: "destructive",
      });
      return { success: false, isFollowed: currentlyFollowed };
    }

    // Optimistically update the UI
    setFollowedChannels(prev => {
      const newSet = new Set(prev);
      if (!currentlyFollowed) {
        newSet.add(channelId);
      } else {
        newSet.delete(channelId);
      }
      return newSet;
    });

    setIsLoading(prev => ({ ...prev, [channelId]: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/follow-channel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel_id: channelId,
          follow: !currentlyFollowed
        }),
      });

      if (response.ok) {
        const data: FollowChannelResponse = await response.json();
        
        toast({
          title: !currentlyFollowed ? "Channel Followed" : "Channel Unfollowed",
          description: data.message || `Successfully ${!currentlyFollowed ? 'followed' : 'unfollowed'} the channel`,
        });

        // Refresh the full list after successful operation
        refreshFollowedChannels();
        
        return { success: true, isFollowed: !currentlyFollowed };
      } else {
        // Revert optimistic update on failure
        setFollowedChannels(prev => {
          const newSet = new Set(prev);
          if (currentlyFollowed) {
            newSet.add(channelId);
          } else {
            newSet.delete(channelId);
          }
          return newSet;
        });
        throw new Error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      
      // Revert optimistic update on error
      setFollowedChannels(prev => {
        const newSet = new Set(prev);
        if (currentlyFollowed) {
          newSet.add(channelId);
        } else {
          newSet.delete(channelId);
        }
        return newSet;
      });
      
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
      return { success: false, isFollowed: currentlyFollowed };
    } finally {
      setIsLoading(prev => ({ ...prev, [channelId]: false }));
    }
  }, [token, refreshFollowedChannels]);

  const isChannelFollowed = useCallback((channelId: string) => {
    return followedChannels.has(channelId);
  }, [followedChannels]);

  const isChannelLoading = useCallback((channelId: string) => {
    return isLoading[channelId] || false;
  }, [isLoading]);

  const isGlobalLoading = isLoading.__global || false;

  return {
    followedChannels: Array.from(followedChannels),
    toggleFollowChannel,
    isChannelFollowed,
    isChannelLoading,
    initializeFollowedChannels,
    refreshFollowedChannels,
    isInitialized,
    isGlobalLoading,
  };
};