// hooks/useFollowedFeed.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Insight } from "@/components/InsightCard";
import { ApiInsight } from "@/contexts/feedService";
import { transformApiInsights } from "@/lib/transformInsights";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FeedCache {
  feed: Insight[];
  page: number;
  hasMore: boolean;
  timestamp: number;
  totalFollowed: number;
}

const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour cache

export const useFollowedFeed = (user: any, token: string | null) => {
  const [feed, setFeed] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [totalFollowed, setTotalFollowed] = useState(0);
  const limit = 5;

  const cache = useRef<FeedCache | null>(null);
  const initialLoadComplete = useRef(false);
  const tokenRef = useRef(token);

  const fetchFeed = useCallback(async (page: number, isInitialLoad: boolean = false) => {
    // Don't fetch if no token
    if (!tokenRef.current) {
      setIsLoading(false);
      setFeed([]);
      setHasMore(false);
      return;
    }

    const skip = page * limit;

    // Check cache first for initial load
    if (isInitialLoad && cache.current) {
      const isCacheValid = Date.now() - cache.current.timestamp < CACHE_EXPIRY_MS;
      
      if (isCacheValid) {
      
        setFeed(cache.current.feed);
        setPage(cache.current.page);
        setHasMore(cache.current.hasMore);
        setTotalFollowed(cache.current.totalFollowed);
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await fetch(`${API_BASE_URL}/user/followed/feeds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef.current}`
        },
        body: JSON.stringify({
          limit,
          skip
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      const data: ApiInsight[] = responseData.items || [];
      const transformedData = transformApiInsights(data, true);
      const newHasMore = data.length === limit;
      
      if (isInitialLoad) {
        // Update cache for initial load
        cache.current = {
          feed: transformedData,
          page: page + 1,
          hasMore: newHasMore,
          timestamp: Date.now(),
          totalFollowed: responseData.total_followed || 0
        };
        setFeed(transformedData);
        setTotalFollowed(responseData.total_followed || 0);
      } else {
        setFeed(prev => {
          // Filter out any duplicates that might already exist
          const newItems = transformedData.filter(
            newItem => !prev.some(item => item.id === newItem.id)
          );
          const updatedFeed = [...prev, ...newItems];
          
          // Update cache for pagination
          if (cache.current) {
            cache.current = {
              ...cache.current,
              feed: updatedFeed,
              page: page + 1,
              hasMore: newHasMore
            };
          }
          
          return updatedFeed;
        });
      }
      
      setHasMore(newHasMore);
      setPage(page + 1);
    } catch (error) {
      setError(error as Error);
      console.error("Error fetching followed feed:", error);
      // toast({
      //   title: "Error",
      //   description: "Failed to fetch followed channels feed. Please try again later.",
      //   variant: "destructive"
      // });
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []); // Removed token from dependencies

  const loadInitialFeed = useCallback(async () => {
    // Reset page and hasMore when loading initial feed
    setPage(0);
    setHasMore(true);
    await fetchFeed(0, true);
  }, [fetchFeed]);

  const resetAndRefresh = () => {
  cache.current = null;
  setPage(0);
  setHasMore(true);
  return fetchFeed(0, true);
};


  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchFeed(page);
  }, [hasMore, isLoadingMore, page, fetchFeed]);

  // Update token ref when token changes
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Initial load and reload when token changes
  useEffect(() => {
    if (!initialLoadComplete.current) {
      initialLoadComplete.current = true;
      loadInitialFeed();
    } else if (token) {
      // If token changes and we already did initial load, refresh
      loadInitialFeed();
    } else {
      // If token is removed, clear the feed
      setFeed([]);
      setHasMore(false);
    }
  }, [token, loadInitialFeed]);

  return { 
    feed, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    totalFollowed,
    loadMore,
    hardRefresh:resetAndRefresh,
    refresh: loadInitialFeed
  };
};