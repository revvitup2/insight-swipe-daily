
"use client";
import { useRef } from "react";
import { Heart, Share, Save, Twitter, Youtube, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import ByteMeLogo from "@/components/ByteMeLogo";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentControl from "@/components/ContentControl";

interface Influencer {
  id: string;
  name: string;
  channel_id:string;
  profileImage: string;
  isFollowed: boolean;
}

const industryIcons: Record<string, string> = {
  finance: "💰",
  ai: "🤖",
  healthcare: "🏥",
  startups: "🚀",
  business: "💼",
  technology: "💻",
  marketing: "📢",
  design: "🎨",
  general: "📰",
  science: "🔬",
  education: "🎓",
  politics: "🏛️",
  entertainment: "🎬"
};

const getIndustryIcon = (industry: string) => {
  const lowerIndustry = industry.toLowerCase();
  return industryIcons[lowerIndustry] || industryIcons['general'];
};

export interface Insight {
  id: string;
  title: string;
  summary: string;
  image: string;
  industry: string;
  influencer: Influencer;
  isSaved: boolean;
  isLiked: boolean;
  keyPoints: string[];
  sentiment: string;
  publishedAt: string;
  source: "youtube" | "twitter" | "linkedin" | "other";
  sourceUrl: string;
}

interface InsightCardProps {
  insight: Insight;
  onSave: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onFollowInfluencer: (influencerId: string) => void;
  onInfluencerClick: (influencerId: string) => void;
  position: string;
  onSourceClick?: (url: string) => void;
  userIndustries?: string[];
    onClick?: (id: string) => void;
}

export const PlatformIcon = ({ source }: { source: string }) => {
  const iconProps = { className: "w-4 h-4", strokeWidth: 2 };

  switch (source) {
    case "youtube":
      return <Youtube {...iconProps} />;
    case "twitter":
      return <Twitter {...iconProps} />;
    case "linkedin":
      return <Linkedin {...iconProps} />;
    default:
      return null;
  }
};

export const InsightCard = ({
  insight,
  onSave,
  onLike,
  onShare,
  onFollowInfluencer,
  onInfluencerClick,
  position,
  onSourceClick,
  onClick,
  userIndustries = [],
}: InsightCardProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isPreferredIndustry = userIndustries.some(industry => 
    insight.industry.toLowerCase().includes(industry.toLowerCase())
  );

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(insight.id);
    
    if (!insight.isSaved) {
      toast({
        title: "Insight saved",
        description: "You can find it in your saved items",
      });
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(insight.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(insight.id);
  };

  const handleFollowInfluencer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollowInfluencer(insight.influencer.id);
    
    toast({
      title: insight.influencer.isFollowed 
        ? `Unfollowed ${insight.influencer.name}`
        : `Following ${insight.influencer.name}`,
      description: insight.influencer.isFollowed 
        ? "You won't see their content in your feed"
        : "You'll see their Bytes in your feed",
    });
  };

  const handleInfluencerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInfluencerClick(insight.influencer.id);
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSourceClick && insight.sourceUrl) {
      onSourceClick(insight.sourceUrl);
    }
  };

  const handleHideInfluencer = () => {
    // Add to hidden influencers list
    const hiddenInfluencers = JSON.parse(localStorage.getItem("hiddenInfluencers") || "[]");
    if (!hiddenInfluencers.includes(insight.influencer.id)) {
      hiddenInfluencers.push(insight.influencer.id);
      localStorage.setItem("hiddenInfluencers", JSON.stringify(hiddenInfluencers));
    }
  };

  const handleHideTopic = () => {
    // Add to hidden topics list
    const hiddenTopics = JSON.parse(localStorage.getItem("hiddenTopics") || "[]");
    if (!hiddenTopics.includes(insight.industry)) {
      hiddenTopics.push(insight.industry);
      localStorage.setItem("hiddenTopics", JSON.stringify(hiddenTopics));
    }
  };

  const handleReport = () => {
    // Store report (in real app, this would send to backend)
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");
    reports.push({
      insightId: insight.id,
      reportedAt: new Date().toISOString(),
      reason: "user_report"
    });
    localStorage.setItem("reports", JSON.stringify(reports));
  };

  const timeAgo = insight.publishedAt 
    ? formatDistanceToNow(new Date(insight.publishedAt), { addSuffix: false })
    : '';

      const handleCardClick = () => {
    if (onClick) {
      onClick(insight.id);
    }
  };

  return (
   <div 
  className={cn(
    "insight-card w-full p-4 flex flex-col overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow",
    "border border-gray-200 dark:border-gray-800",
    position
  )}
    onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
>
       <div className="flex-1 flex flex-col overflow-hidden">
    {/* Image Section */}
    <div className="relative mb-4 rounded-xl overflow-hidden">
      <img
        src={insight.image}
        alt={insight.title}
        className="insight-image rounded-xl"
      />
      
      {/* ByteMe Brand Watermark - Top right */}
      <div className="absolute top-2 right-2">
        <ByteMeLogo size="sm" className="opacity-80" />
      </div>
      
      {/* Content Control - Top right corner */}
      <div className="absolute top-2 left-2" onClick={(e) => e.stopPropagation()}>
        <ContentControl
          influencerName={insight.influencer.name}
          topic={insight.industry}
          onHideInfluencer={handleHideInfluencer}
          onHideTopic={handleHideTopic}
          onReport={handleReport}
        />
      </div>
      
      {/* Industry Tag - Subtle black background */}
      <div className="absolute bottom-2 left-2 flex items-center bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
        {insight.industry}
      </div>
          
          {/* Source Platform - Subtle black background */}
            {insight.source && (
        <div 
          className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-black/80 transition-colors text-white"
          onClick={handleSourceClick}
        >
          <PlatformIcon source={insight.source} />
        </div>
      )}
    </div>
    
    {/* Title Section */}
    <h2 className="text-lg font-bold mb-2 leading-tight text-gray-900 dark:text-white">
      {insight.title}
    </h2>
        
        {/* Scrollable Summary Content */}
          <ScrollArea className="flex-1 mb-4 pr-2 max-h-[250px]">
      <p className="text-base text-gray-700 dark:text-gray-300">
        {insight.summary}
      </p>
    </ScrollArea>

  </div>
   <div>
 <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div 
          className="flex items-center cursor-pointer" 
          // onClick={handleInfluencerClick}
        >
          <span className="text-sm font-medium mr-2 text-gray-900 dark:text-white truncate max-w-[220px]">
            {insight.influencer.name}
          </span>
        </div>
      </div>
      
      {timeAgo && (
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      )}
    </div>
    
    {/* Interaction Buttons */}
    <div className="flex items-center space-x-4">
      <button 
        className="interaction-btn flex items-center gap-1 text-sm" 
        onClick={handleSave}
        aria-label="Save"
      >
        <Save 
          className={cn("w-5 h-5", 
            insight.isSaved ? "fill-primary text-primary" : "text-gray-500 dark:text-gray-400"
          )} 
        />
      </button>
      
      <button 
        className="interaction-btn flex items-center gap-1 text-sm" 
        onClick={handleShare}
        aria-label="Share"
      >
        <Share className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  </div>
</div>
  );
};

export default InsightCard;