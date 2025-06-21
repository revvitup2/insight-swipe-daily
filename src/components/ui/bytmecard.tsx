// components/ByteCard.tsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save, Share, Trash } from "lucide-react";
import ByteMeLogo from "@/components/ByteMeLogo";
import { PlatformIcon } from "@/components/InsightCard";
import { formatDistanceToNow } from "date-fns";
import { FollowButton } from "@/contexts/follow_button_props";

interface ByteCardProps {
  bite: {
    id: string;
    title: string;
    summary: string;
    image: string;
    industry: string;
    publishedAt: string;
    influencer: {
      name: string;
        channel_id: string;
    };
    source: "youtube" | "twitter" | "linkedin" | "other";
    sourceUrl?: string;
    isSaved?: boolean;
  };
  isDarkMode: boolean;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onRemove?: (id: string) => void;
  onClick: (id: string) => void;
  variant?: "default" | "saved";
  isChannelFollowed?: boolean;
  isChannelLoading?: boolean;
  onFollowToggle?: (channelId: string, currentlyFollowed: boolean) => Promise<void>;
}

export const ByteCard = ({
  bite,
  isDarkMode,
  onSave,
  onShare,
  onRemove,
  onClick,
  variant = "default",
  isChannelFollowed = false,
  isChannelLoading = false,
  onFollowToggle,
}: ByteCardProps) => {

    const handleFollowToggle = async (e: React.MouseEvent) => {
    
    e.stopPropagation();
    if (isChannelLoading || !onFollowToggle || !bite.influencer.channel_id) return;
    await onFollowToggle(bite.influencer.channel_id, isChannelFollowed);
  };

  
  const timeAgo = formatDistanceToNow(new Date(bite.publishedAt), { addSuffix: false });

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(bite.id);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave?.(bite.id);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.(bite.id);
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bite.sourceUrl) {
      window.open(bite.sourceUrl, '_blank');
    }
  };

  return (
    <div
      data-insight-id={bite.id}
      className={cn(
        "rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
        isDarkMode
          ? "bg-gray-800 border-gray-700 hover:shadow-gray-700/30"
          : "bg-white border-gray-200 hover:shadow-md"
      )}
      onClick={() => onClick(bite.id)}
    >
      <div className="sm:flex">
        {/* Image Section */}
        <div className="sm:w-1/3 relative aspect-video sm:aspect-auto sm:h-full">
          <img
            src={bite.image}
            alt={bite.title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-2 right-2">
            <ByteMeLogo size="sm" className="opacity-80" />
          </div>
          
          <div className={cn(
            "absolute bottom-2 left-2 flex items-center px-2 py-1 rounded-md text-xs font-medium",
            isDarkMode
              ? "bg-gray-700/90 backdrop-blur-sm text-white"
              : "bg-black/70 backdrop-blur-sm text-white"
          )}>
            {bite.industry}
          </div>

          {bite.source && (
            <div 
              className={cn(
                "absolute bottom-2 right-2 p-2 rounded-full cursor-pointer transition-colors text-white",
                isDarkMode
                  ? "bg-gray-700/90 hover:bg-gray-600/90"
                  : "bg-black/70 hover:bg-black/80"
              )}
              onClick={handleSourceClick}
            >
              <PlatformIcon source={bite.source} />
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="p-4 sm:w-2/3">
        <div className="flex items-center mb-3">
  <div className="flex items-center w-full">
    <span className={cn(
      "text-sm font-medium",
      isDarkMode ? "text-gray-300" : "text-gray-700"
    )}>
      {bite.influencer.name}
    </span>
    <span className="ml-2 mr-1">•</span>
    <span className={cn(
      "text-xs",
      isDarkMode ? "text-gray-500" : "text-gray-400"
    )}>
      {timeAgo}
    </span>
  </div>

  <FollowButton
    isFollowing={isChannelFollowed}
    isLoading={isChannelLoading}
    onClick={handleFollowToggle}
    className="ml-4" // use ml-2 or ml-4 depending on spacing needs
  />
</div>

          
          <h3 className={cn(
            "font-bold text-lg mb-2 line-clamp-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {bite.title}
          </h3>
          
          <p className={cn(
            "text-sm line-clamp-3 mb-4",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {bite.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {variant === "default" && onSave && (
                <button
                  onClick={handleSaveClick}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    "text-gray-400 hover:text-primary"
                  )}
                >
                  <Save className={cn("w-5 h-5", { "fill-primary text-primary": bite.isSaved })} />
                </button>
              )}
              
              {onShare && (
                <button
                  onClick={handleShareClick}
                  className="p-2 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <Share className="w-5 h-5" />
                </button>
              )}
              
              {variant === "saved" && onRemove && (
                <button
                  onClick={handleRemoveClick}
                  className="p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};