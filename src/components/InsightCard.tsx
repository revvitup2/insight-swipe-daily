
import { useState } from "react";
import { Heart, Share, Save, Twitter, Youtube, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Influencer {
  id: string;
  name: string;
  profileImage: string;
  isFollowed: boolean;
}

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
}: InsightCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

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
    ? formatDistanceToNow(new Date(insight.publishedAt), { addSuffix: true })
    : '';

  return (
    <div 
      className={cn(
        "insight-card w-full p-4 flex flex-col overflow-hidden",
        position
      )}
    >
      <div className="flex-1 flex flex-col">
        {/* Image Section - Top 30% */}
        <div className="relative mb-4 rounded-xl overflow-hidden">
          <img
            src={insight.image}
            alt={insight.title}
            className="insight-image rounded-xl"
          />
          <span className="industry-tag">{insight.industry}</span>
          
          {insight.source && (
            <div 
              className="platform-tag"
              onClick={handleSourceClick}
            >
              <PlatformIcon source={insight.source} />
            </div>
          )}
        </div>
        
        {/* Title Section */}
        <h2 className="text-2xl font-bold mb-2 leading-tight">{insight.title}</h2>
        
        {/* Summary Content */}
        <p className="text-base text-gray-700 mb-6 flex-grow">{insight.summary}</p>
        
        {/* Metadata */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={handleInfluencerClick}
            >
              <img
                src={insight.influencer.profileImage}
                alt={insight.influencer.name}
                className="influencer-avatar mr-2"
              />
              <span className="text-sm font-medium mr-2">{insight.influencer.name}</span>
            </div>
            
            {!insight.influencer.isFollowed ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFollowInfluencer}
                className="text-xs h-7 px-2"
              >
                Follow
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFollowInfluencer}
                className="text-xs h-7 px-2 bg-muted/50"
              >
                Following
              </Button>
            )}
          </div>
          
          {timeAgo && (
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          )}
        </div>
        
        {/* Interaction Buttons */}
        <div className="flex items-center space-x-4">
          <button 
            className="interaction-btn" 
            onClick={handleLike}
            aria-label="Like"
          >
            <Heart 
              className={cn("w-5 h-5", 
                insight.isLiked ? "fill-red-500 text-red-500" : ""
              )} 
            />
          </button>
          
          <button 
            className="interaction-btn" 
            onClick={handleSave}
            aria-label="Save"
          >
            <Save 
              className={cn("w-5 h-5", 
                insight.isSaved ? "fill-primary text-primary" : ""
              )} 
            />
          </button>
          
          <button 
            className="interaction-btn" 
            onClick={handleShare}
            aria-label="Share"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
