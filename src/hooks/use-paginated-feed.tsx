// hooks/usePaginatedFeed.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { Insight } from "@/components/InsightCard";
import { useSelectedIndustries } from "@/contexts/selectedIndustries";
import { ApiInsight } from "@/contexts/feedService";
import { transformApiInsights } from "@/lib/transformInsights";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FeedCache {
  [industriesKey: string]: {
    feed: Insight[];
    page: number;
    hasMore: boolean;
    timestamp: number;
  };
}

const CACHE_EXPIRY_MS = 60 * 60 * 1000;

export const usePaginatedFeed = (user: any, token: string) => {
  const [feed, setFeed] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 5;

  const { selectedIndustries } = useSelectedIndustries(user, token);
  const cache = useRef<FeedCache>({});
  const hasIndustriesLoaded = useRef(false);

  // Create a stable key for the cache based on selected industries
  const industriesKey = selectedIndustries.sort().join(',');

  const transformApiData = useCallback((data: ApiInsight[]): Insight[] => {
    return transformApiInsights(data, false); 
  }, []);

  const fetchFeed = useCallback(async (page: number, isInitialLoad: boolean = false) => {
    const skip = page * limit;

    // Check cache first for initial load
    if (isInitialLoad && cache.current[industriesKey]) {
      const cachedData = cache.current[industriesKey];
      const isCacheValid = Date.now() - cachedData.timestamp < CACHE_EXPIRY_MS;
      
      if (isCacheValid) {
        setFeed(cachedData.feed);
        setPage(cachedData.page);
        setHasMore(cachedData.hasMore);
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

      const response = await fetch(`${API_BASE_URL}/generic/feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          industries: selectedIndustries,
          limit,
          skip
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiInsight[] = await response.json();
      const transformedData = transformApiData(data);
      const newHasMore = data.length === limit;
      
      if (isInitialLoad) {
        // Update cache for initial load
        cache.current[industriesKey] = {
          feed: transformedData,
          page: page + 1,
          hasMore: newHasMore,
          timestamp: Date.now()
        };
        setFeed(transformedData);
      } else {
        setFeed(prev => {
          // Filter out any duplicates that might already exist
          const newItems = transformedData.filter(
            newItem => !prev.some(item => item.id === newItem.id)
          );
          const updatedFeed = [...prev, ...newItems];
          
          // Update cache for pagination
          if (cache.current[industriesKey]) {
            cache.current[industriesKey] = {
              ...cache.current[industriesKey],
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
      console.error("Error fetching feed:", error);
      toast({
        title: "Error",
        description: "Failed to fetch feed. Please try again later.",
        variant: "destructive"
      });
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, [selectedIndustries, token, transformApiData, industriesKey]);

  const loadInitialFeed = useCallback(async () => {
    // Reset page and hasMore when loading initial feed
    setPage(0);
    setHasMore(true);
    await fetchFeed(0, true);
  }, [fetchFeed]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchFeed(page);
  }, [hasMore, isLoadingMore, page, fetchFeed]);

  // Single useEffect to handle both initial load and industry changes
  useEffect(() => {
    // Use a small delay to ensure selectedIndustries has stabilized
    const timeoutId = setTimeout(() => {
      if (!hasIndustriesLoaded.current) {
        hasIndustriesLoaded.current = true;
        loadInitialFeed();
      } else {
        // Industries have changed, reload feed
        loadInitialFeed();
      }
    }, 100); // Small delay to let selectedIndustries stabilize

    return () => clearTimeout(timeoutId);
  }, [industriesKey, loadInitialFeed]);
    

  return { 
    feed, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    loadMore,
    refresh: loadInitialFeed
  };
};