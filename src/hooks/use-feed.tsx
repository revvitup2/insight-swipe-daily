import { useState, useEffect } from "react";
import { Insight } from "@/components/InsightCard";
import { fetchFeed } from "@/contexts/feedService";

export const useFeed = () => {
  const [feed, setFeed] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setIsLoading(true);
        const data = await fetchFeed();
        setFeed(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, []);

  return { feed, isLoading, error };
};