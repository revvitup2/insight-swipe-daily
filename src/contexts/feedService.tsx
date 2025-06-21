import { toast } from "@/hooks/use-toast";
import { Insight } from "@/components/InsightCard";
import { transformApiInsights } from "@/lib/transformInsights";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiInsight {
  influencer_id: string;
  video_id: string;
  published_at: string;
  industry: string;
  metadata: {
    channel_id:string;
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
    const response = await fetch(`${API_BASE_URL}/explore/feed`, {
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
      const dataTransformed = transformApiInsights(data.items, false); 
    return dataTransformed;
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