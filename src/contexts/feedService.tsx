import { toast } from "@/hooks/use-toast";
import { Insight } from "@/components/InsightCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiInsight {
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

export const fetchFeed = async (
  industries?: string[],
  limit: number = 20,
  skip: number = 0
): Promise<Insight[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/feed/paginated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        industries,
        limit,
        skip
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => {
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
  } catch (error) {
    console.error("Error fetching feed:", error);
    toast({
      title: "Error",
      description: "Failed to fetch feed. Please try again later.",
      variant: "destructive"
    });
    throw error;
  }
};