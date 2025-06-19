// hooks/use-feed.ts
import { useState, useEffect, useCallback } from "react";
import { Insight } from "@/components/InsightCard";
import { fetchFeed } from "@/contexts/feedService";

export const useFeed = (industries?: string[]) => {
  const [feed, setFeed] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 10; // Reduced from 20 for smoother loading

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const newItems = await fetchFeed(industries, limit, skip);
      
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setFeed(prev => [...prev, ...newItems]);
        setSkip(prev => prev + newItems.length);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, industries, skip]);

  const refreshFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setSkip(0);
      setHasMore(true);
      const initialItems = await fetchFeed(industries, limit, 0);
      setFeed(initialItems);
      setSkip(initialItems.length);
      setHasMore(initialItems.length === limit);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [industries]);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  return { 
    feed, 
    isLoading, 
    isLoadingMore,
    error, 
    hasMore, 
    loadMore, 
    refreshFeed 
  };
};


export const useInfiniteScroll = (loadMore: () => void, isLoading: boolean) => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const scrollThreshold = document.documentElement.offsetHeight - 500; // 500px from bottom

      if (scrollPosition >= scrollThreshold && !isLoading) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, isLoading]);
};