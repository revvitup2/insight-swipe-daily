// components/SavedInsightCard.tsx
import { Insight, PlatformIcon } from "./InsightCard";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ByteMeLogo from "@/components/ByteMeLogo";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface SavedInsightCardProps {
  insight: Insight;
  onRemove: (id: string) => void;
}

export const SavedInsightCard = ({ insight, onRemove }: SavedInsightCardProps) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(insight.id);
  };

  const handleClick = () => {
    navigate(`/bytes/${insight.id}`);
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (insight.sourceUrl) {
      window.open(insight.sourceUrl, '_blank');
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col sm:flex-row border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full",
        isDarkMode 
          ? "bg-gray-800 border-gray-700 hover:shadow-gray-700/30" 
          : "bg-white border-gray-200 hover:shadow-md"
      )}
      onClick={handleClick}
    >
      <div className="sm:w-1/3 relative aspect-video sm:aspect-auto sm:h-full">
        <img
          src={insight.image}
          alt={insight.title}
          className="w-full h-full object-cover"
        />
        
        {/* ByteMe Brand Watermark - Top right */}
        <div className="absolute top-2 right-2">
          <ByteMeLogo size="sm" className="opacity-80" />
        </div>
        
        {/* Industry Tag - Bottom left with subtle black background */}
        <div className={cn(
          "absolute bottom-2 left-2 flex items-center px-2 py-1 rounded-md text-xs font-medium",
          isDarkMode 
            ? "bg-gray-700/90 backdrop-blur-sm text-white" 
            : "bg-black/70 backdrop-blur-sm text-white"
        )}>
          {insight.industry}
        </div>
        
        {/* Source Platform - Bottom right with subtle black background */}
        {insight.source && (
          <div 
            className={cn(
              "absolute bottom-2 right-2 p-2 rounded-full cursor-pointer transition-colors text-white",
              isDarkMode 
                ? "bg-gray-700/90 hover:bg-gray-600/90" 
                : "bg-black/70 hover:bg-black/80"
            )}
            onClick={handleSourceClick}
          >
            <PlatformIcon source={insight.source} />
          </div>
        )}
      </div>
      
      <div className="sm:w-2/3 p-4 flex flex-col">
        <div className="flex-grow">
          <h3 className={cn(
            "font-semibold text-lg line-clamp-2 mb-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            {insight.title}
          </h3>
          <p className={cn(
            "text-sm line-clamp-3 mb-4",
            isDarkMode ? "text-gray-300" : "text-muted-foreground"
          )}>
            {insight.summary}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <img
              src={insight.influencer.profileImage}
              alt={insight.influencer.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className={cn(
              "text-sm",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              {insight.influencer.name}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className={cn(
              "text-xs h-8",
              isDarkMode ? "border-gray-600 hover:bg-gray-700" : ""
            )}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};