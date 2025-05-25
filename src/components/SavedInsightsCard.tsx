// components/SavedInsightCard.tsx
import { Insight, PlatformIcon } from "./InsightCard";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ByteMeLogo from "@/components/ByteMeLogo";

interface SavedInsightCardProps {
  insight: Insight;
  onRemove: (id: string) => void;
}

export const SavedInsightCard = ({ insight, onRemove }: SavedInsightCardProps) => {
  const navigate = useNavigate();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(insight.id);
  };

  const handleClick = () => {
   navigate(`/insights/${insight.id}`);
  };

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (insight.sourceUrl) {
      // Handle source click - open URL or whatever logic you need
      window.open(insight.sourceUrl, '_blank');
    }
  };

  return (
    <div 
      className="flex flex-col sm:flex-row border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow cursor-pointer h-full"
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
        <div className="absolute bottom-2 left-2 flex items-center bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
          {insight.industry}
        </div>
        
        {/* Source Platform - Bottom right with subtle black background */}
        {insight.source && (
          <div 
            className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-black/80 transition-colors text-white"
            onClick={handleSourceClick}
          >
            <PlatformIcon source={insight.source} />
          </div>
        )}
      </div>
      
      <div className="sm:w-2/3 p-4 flex flex-col">
        <div className="flex-grow">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {insight.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
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
            <span className="text-sm">{insight.influencer.name}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-xs h-8"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};