import { useRef } from "react";
import { Heart, Share, Save, Twitter, Youtube, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import ByteMeLogo from "@/components/ByteMeLogo";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Influencer {
  id: string;
  name: string;
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
}

const PlatformIcon = ({ source }: { source: string }) => {
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
        : "You'll see their insights in your feed",
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

  const timeAgo = insight.publishedAt 
    ? formatDistanceToNow(new Date(insight.publishedAt), { addSuffix: false })
    : '';

  console.log("Rendering InsightCard with position:", position, "for insight:", insight.id);

  return (
    <div 
      className={cn(
        "insight-card w-full p-4 flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
        "border border-gray-200 dark:border-gray-800",
        position,
        position && "opacity-100"
      )}
      style={{ 
        zIndex: position === "" ? 10 : 1,
        transform: position === "slide-up" ? "translateY(-100vh)" :
                  position === "slide-down" ? "translateY(100vh)" :
                  position === "slide-left" ? "translateX(-100vw)" :
                  position === "slide-right" ? "translateX(100vw)" : "translateY(0)",
      }}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Image Section - Fixed height */}
        <div className="relative mb-4 rounded-xl overflow-hidden flex-shrink-0">
          <img
            src={insight.image}
            alt={insight.title}
            className="insight-image rounded-xl w-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error("Image failed to load:", insight.image);
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          {/* ByteMe Brand Watermark - Top right */}
          <div className="absolute top-2 right-2">
            <ByteMeLogo size="sm" className="opacity-80" />
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
        
        {/* Title Section - Fixed */}
        <h2 className="text-lg font-bold mb-2 leading-tight text-gray-900 dark:text-white flex-shrink-0 line-clamp-2">
          {insight.title}
        </h2>
            
        {/* Scrollable Summary Content - Flexible height */}
        <div className="flex-1 min-h-0 mb-4">
          <ScrollArea className="h-full pr-2 max-h-[200px]">
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {insight.summary}
            </p>
          </ScrollArea>
        </div>
      </div>
      
      {/* Bottom section - Fixed */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center min-w-0 flex-1">
            <div 
              className="flex items-center cursor-pointer min-w-0" 
              onClick={handleInfluencerClick}
            >
              <img
                src={insight.influencer.profileImage}
                alt={insight.influencer.name}
                className="w-8 h-8 rounded-full mr-2 object-cover flex-shrink-0"
                loading="lazy"
              />
              <span className="text-sm font-medium mr-2 text-gray-900 dark:text-white truncate">
                {insight.influencer.name}
              </span>
            </div>
          </div>
          
          {timeAgo && (
            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{timeAgo}</span>
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
