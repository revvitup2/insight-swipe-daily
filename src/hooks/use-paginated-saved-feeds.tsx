// hooks/usePaginatedFeed.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Insight } from "@/components/InsightCard";
import { useSelectedIndustries } from "@/contexts/selectedIndustries";
import { ApiInsight } from "@/contexts/feedService";
import { transformApiInsights } from "@/lib/transformInsights";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface SavedFeedCache {
  feed: Insight[];
  page: number;
  hasMore: boolean;
  timestamp: number;
}

const CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour cache

export const usePaginatedSavedFeeds = (token: string | null) => {
  const [feed, setFeed] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 5; // Items per load

  const cache = useRef<SavedFeedCache | null>(null);

  const transformApiData = useCallback((data: any[]): Insight[] => {
    return transformApiInsights(data, false);
  }, []);

  const fetchSavedFeeds = useCallback(async (page: number, isInitialLoad: boolean = false) => {
    if (!token) return;

    const skip = page * limit;

    // Check cache first for initial load
    if (isInitialLoad && cache.current) {
      const isCacheValid = Date.now() - cache.current.timestamp < CACHE_EXPIRY_MS;
      
      if (isCacheValid) {
        setFeed(cache.current.feed);
        setPage(cache.current.page);
        setHasMore(cache.current.hasMore);
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

       const response = await fetch(`${API_BASE_URL}/user/saved-feeds-collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          limit,
          skip
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const transformedData = transformApiData(data.saved_feeds);
      const newHasMore = data.has_more;
      
      if (isInitialLoad) {
        // Update cache for initial load
        cache.current = {
          feed: transformedData,
          page: page + 1,
          hasMore: newHasMore,
          timestamp: Date.now()
        };
        setFeed(transformedData);
      } else {
        setFeed(prev => {
          // Filter out any duplicates
          const newItems = transformedData.filter(
            newItem => !prev.some(item => item.id === newItem.id)
          );
          const updatedFeed = [...prev, ...newItems];
          
          // Update cache
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
      console.error("Error fetching saved feeds:", error);
      toast({
        title: "Error",
        description: "Failed to fetch saved feeds. Please try again later.",
        variant: "destructive"
      });
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [token, transformApiData]);

  const loadInitialFeed = useCallback(async () => {
    if (!token) return;
    setPage(0);
    setHasMore(true);
    await fetchSavedFeeds(0, true);
  }, [token, fetchSavedFeeds]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !token) return;
    await fetchSavedFeeds(page);
  }, [hasMore, isLoadingMore, page, fetchSavedFeeds, token]);

  // Handle initial load and token changes
  useEffect(() => {
    if (token) {
      loadInitialFeed();
    } else {
      setFeed([]);
      setIsLoading(false);
      setError(new Error("Authentication required"));
    }
  }, [token, loadInitialFeed]);

  return { 
    feed, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    loadMore,
    refresh: loadInitialFeed,
    removeItem: (id: string) => {
      setFeed(prev => prev.filter(item => item.id !== id));
      if (cache.current) {
        cache.current.feed = cache.current.feed.filter(item => item.id !== id);
      }
    }
  };
};