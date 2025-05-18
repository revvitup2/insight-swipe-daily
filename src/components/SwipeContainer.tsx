
import React, { useContext } from 'react';
import InsightCard, { Insight } from './InsightCard';

interface SwipeContainerProps {
  insights: Insight[];
  positions: string[];
  onSave: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onFollowInfluencer: (influencerId: string) => void;
  onInfluencerClick: (influencerId: string) => void;
  onSourceClick?: (url: string) => void;
  userIndustries: string[];
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick: () => void;
}

const SwipeContainer = React.forwardRef<HTMLDivElement, SwipeContainerProps>(
  ({
    insights,
    positions,
    onSave,
    onLike,
    onShare,
    onFollowInfluencer,
    onInfluencerClick,
    onSourceClick,
    userIndustries,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onClick
  }, ref) => {
    return (
      <div 
        className="swipe-container h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onClick}
        ref={ref}
      >
        {insights.map((insight, index) => (
          <InsightCard 
            key={insight.id}
            insight={insight}
            onSave={onSave}
            onLike={onLike}
            onShare={onShare}
            onFollowInfluencer={onFollowInfluencer}
            onInfluencerClick={onInfluencerClick}
            onSourceClick={onSourceClick}
            position={positions[index] || ""}
            userIndustries={userIndustries}
          />
        ))}
      </div>
    );
  }
);

SwipeContainer.displayName = "SwipeContainer";

export default SwipeContainer;
