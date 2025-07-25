"use client";
import { useRef, useState } from "react";
import { Heart, Share, Save, Twitter, Youtube, Linkedin, UserPlus, UserMinus, Loader2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import ByteMeLogo from "@/components/ByteMeLogo";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContentControl from "@/components/ContentControl";
import { FollowButton } from "@/contexts/follow_button_props";
import { useAutoHide } from "@/hooks/use-auto-hide";

interface Influencer {
  id: string;
  name: string;
  channel_id: string;
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
  fullSummary?: string; // New field for full-byte mode
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
  onInfluencerClick: (influencerId: string) => void;
  position: string;
  onSourceClick?: (url: string) => void;
  userIndustries?: string[];
  onClick?: (id: string) => void;
  onSummaryEdgeAttempt?: (direction: "up" | "down") => void;
  // New props for follow functionality
  isChannelFollowed: boolean;
  isChannelLoading: boolean;
   onFollowToggle?: (channelId: string, currentlyFollowed: boolean) => Promise<void>;
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
  onInfluencerClick,
  position,
  onSourceClick,
  onClick,
  userIndustries = [],
  onSummaryEdgeAttempt,
  onSummaryTouchStart,
  onSummaryTouchEnd,
  isChannelFollowed,
  isChannelLoading,
  onFollowToggle,
}: InsightCardProps & {
  onSummaryTouchStart?: () => void,
  onSummaryTouchEnd?: () => void,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const pendingEdgeDirection = useRef<"up" | "down" | null>(null);
  const [isBigByteMode, setIsBigByteMode] = useState(false);
  const isFloatingButtonVisible = useAutoHide(3000);
  
  const isPreferredIndustry = userIndustries.some(industry => 
    insight.industry.toLowerCase().includes(industry.toLowerCase())
  );

  

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(insight.id);
    
    if (!insight.isSaved) {
      // toast({
      //   title: "Byte saved",
      //   description: "You can find it in your saved items",
      // });
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

    const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isChannelLoading || !onFollowToggle || !insight.influencer.channel_id) return;
    await onFollowToggle(insight.influencer.channel_id, isChannelFollowed);
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

  // Enhanced touch handling for summary scroll area
  const handleSummaryTouchMove = (e: React.TouchEvent) => {
    if (!summaryRef.current || !onSummaryEdgeAttempt) return;
    
    const scrollArea = summaryRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!scrollArea) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollArea;
    const touch = e.touches[0];
    const deltaY = touch.clientY - ((scrollArea as any)._lastTouchY || touch.clientY);
    (scrollArea as any)._lastTouchY = touch.clientY;

    // Check if we're at scroll boundaries and user is trying to scroll further
    const isAtTop = scrollTop <= 1;
    const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 1;
    
    // Store pending direction but don't trigger navigation yet
    if (deltaY > 10 && isAtTop) {
      pendingEdgeDirection.current = "up";
    } else if (deltaY < -10 && isAtBottom) {
      pendingEdgeDirection.current = "down";
    } else {
      pendingEdgeDirection.current = null;
    }
  };

  const handleSummaryTouchStartInner = (e: React.TouchEvent) => {
    if (summaryRef.current) {
      const scrollArea = summaryRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollArea) {
        (scrollArea as any)._lastTouchY = e.touches[0].clientY;
      }
    }
    pendingEdgeDirection.current = null;
    if (onSummaryTouchStart) onSummaryTouchStart();
  };

  const handleSummaryTouchEndInner = (e: React.TouchEvent) => {
    if (summaryRef.current) {
      const scrollArea = summaryRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollArea) {
        delete (scrollArea as any)._lastTouchY;
      }
    }
    
    // Only trigger navigation on touch end if there was a pending edge direction
    if (pendingEdgeDirection.current && onSummaryEdgeAttempt) {
      onSummaryEdgeAttempt(pendingEdgeDirection.current);
    }
    
    pendingEdgeDirection.current = null;
    if (onSummaryTouchEnd) onSummaryTouchEnd();
  };

  const handleCardClick = () => {
    // if (onClick) {
    //   onClick(insight.id);
    // }
  };
  const truncateSummary = (text: string, wordLimit: number = 100) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Generate big-byte content from key points if not provided
  const getBigByteContent = () => {
    if (insight.fullSummary) {
      return insight.fullSummary;
    }
    
    // Generate from key points if available
    if (insight.keyPoints && insight.keyPoints.length > 0) {
      return insight.keyPoints.slice(0, 5).map((point, index) => 
        `• ${point.trim()}`
      ).join('\n\n');
    }
    
    // Fallback: expand the summary
    return insight.summary;
  };

  const handleBigByteToggle = () => {
    setIsBigByteMode(!isBigByteMode);
  };

  

  return (
   <div 
    className={cn(
      "insight-card w-full p-4  flex flex-col overflow-hidden bg-white dark:bg-gray-900  shadow-sm hover:shadow-md transition-shadow",
      "border border-gray-200 dark:border-gray-800",
      position
    )}
    onClick={handleCardClick}
    style={{ cursor: 'pointer' }}
  >
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Image Section */}
        <div className="relative mb-2 rounded-xl overflow-hidden mt-16"> 
        <img
          src={insight.image}
          alt={insight.title}
          className="insight-image rounded-xl h-36 object-cover w-full"
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
      
      {/* Summary Content */}
      <div className="flex-1 mb-3 pr-2">
        <div className={cn(
          "text-base text-gray-700 dark:text-gray-300 leading-relaxed transition-all duration-300",
          isBigByteMode ? "animate-fade-in" : ""
        )}>
          {isBigByteMode ? (
            <div className="whitespace-pre-line">
              {getBigByteContent()}
            </div>
          ) : (
            <p>{truncateSummary(insight.summary, 100)}</p>
          )}
        </div>
      </div>
    </div>
    
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center flex-1 min-w-0">
          <div 
            className="flex items-center cursor-pointer min-w-0 flex-1" 
            onClick={handleInfluencerClick}
          >
            <span className="text-sm font-medium mr-2 text-gray-900 dark:text-white truncate">
              {insight.influencer.name}
            </span>
               <span className="mx-2">•</span>
            <span className={cn(
              "text-xs",
               "text-gray-400"
            )}>
              {timeAgo}
            </span>

          </div>
          
          {/* Follow/Unfollow Button */}
      
<FollowButton
  isFollowing={isChannelFollowed}
  isLoading={isChannelLoading}
  onClick={handleFollowToggle}
  className="ml-2"
/>
        </div>
        
       
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

    {/* Floating Byte Toggle Button */}
    <div className={cn(
      "fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300",
      !isFloatingButtonVisible && "translate-y-full opacity-0"
    )}>
      <button
        onClick={handleBigByteToggle}
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-200 shadow-lg",
          "bg-violet-100 hover:bg-violet-200 text-violet-800 border border-violet-300",
          "dark:bg-violet-900/80 dark:hover:bg-violet-900 dark:text-violet-200 dark:border-violet-700",
          "hover:shadow-xl hover:scale-105 active:scale-95 backdrop-blur-sm"
        )}
      >
        <ArrowUpDown className="w-4 h-4" />
        {isBigByteMode ? "Small-byte" : "Big-byte"}
      </button>
    </div>
  </div>
  );
};

export default InsightCard;