import { toast } from "@/hooks/use-toast";
import { Insight } from "@/components/InsightCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiInsight {
  influencer_id: string;
  video_id: string;
  published_at: string;
  industry: string;
  metadata: {
    title: string;
    description: string;
    channel_title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    tags: string[];
  };
  analysis: {
    summary: string;
    key_points: string[];
    sentiment: string;
    topics: string[];
  };
  source?: {
    platform: "youtube" | "twitter" | "linkedin" | "other";
    url: string;
  };
}

let cachedFeed: Insight[] | null = null;
let fetchPromise: Promise<Insight[]> | null = null;

export const fetchFeed = async (): Promise<Insight[]> => {
  if (cachedFeed) return cachedFeed;
  if (fetchPromise) return fetchPromise;

  // eslint-disable-next-line no-async-promise-executor
  fetchPromise = new Promise<Insight[]>(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/feed`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiInsight[] = await response.json();
      
      cachedFeed = data.map((item) => {
        const sourceUrl = item.source?.url || `https://youtube.com/watch?v=${item.video_id}`;
        
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
          title: item.metadata.title,
          summary: item.analysis.summary,
          image: item.metadata.thumbnails.high.url,
          industry: item.industry || "General",
          influencer: {
            id: item.influencer_id,
            name: item.metadata.channel_title,
            channel_id: item.influencer_id,
            profileImage: "",
            isFollowed: false
          },
          isSaved: false,
          isLiked: false,
          keyPoints: item.analysis.key_points,
          sentiment: item.analysis.sentiment,
          publishedAt: item.published_at,
          source: sourcePlatform,
          sourceUrl: sourceUrl
        };
      });

      resolve(cachedFeed);
    } catch (error) {
      console.error("Error fetching feed:", error);
      toast({
        title: "Error",
        description: "Failed to fetch feed. Please try again later.",
        variant: "destructive"
      });
      reject(error);
    } finally {
      fetchPromise = null;
    }
  });

  return fetchPromise;
};

export const invalidateFeedCache = (): void => {
  cachedFeed = null;
};