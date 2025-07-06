// utils/transformInsight.ts
import { Insight } from "@/components/InsightCard";
import { industries } from "@/components/OnboardingFlow";
import { ApiInsight } from "@/contexts/feedService";

export const transformApiInsight = (item: ApiInsight, isFollowed: boolean = false): Insight => {
  const sourceUrl =  `https://youtube.com/watch?v=${item.video_id}`;
  
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
   const industryEntry = industries.find(industry => industry.id === item.industry);
  const industryName = industryEntry ? industryEntry.name : "Ai tools";
  
  return {
    id: item.video_id,
    title: item.metadata?.title || "Untitled",
    summary: item.analysis?.summary || "",
    image: item.metadata?.thumbnails?.high?.url || "",
     industry: industryName,
    influencer: {
      id: item.influencer_id,
      name: item.metadata?.channel_title || "Unknown",
      channel_id: item.metadata?.channel_id || "",
      profileImage: "",
      isFollowed: isFollowed
    },
    isSaved: false,
    isLiked: false,
    keyPoints: item.analysis?.key_points || [],
    sentiment: item.analysis?.sentiment || "neutral",
    publishedAt: item.published_at,
    source: sourcePlatform,
    sourceUrl: sourceUrl
  };
};

export const transformApiInsights = (data: ApiInsight[], isFollowed: boolean = false): Insight[] => {
  return data.map(item => transformApiInsight(item, isFollowed));
};