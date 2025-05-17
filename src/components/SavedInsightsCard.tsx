// components/SavedInsightCard.tsx
import { Insight } from "./InsightCard";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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
    navigate(`/?insight=${insight.id}`);
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
        <div className="absolute bottom-2 left-2 bg-background/90 px-2 py-1 rounded-md text-xs font-medium">
          {insight.industry}
        </div>
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