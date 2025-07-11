import React, { useContext } from 'react';
import InsightCard, { Insight } from './InsightCard';

interface SwipeContainerProps {
  Bytes: Insight[];
  positions: string[];
  onSave: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onInfluencerClick: (influencerId: string) => void;
  onSourceClick?: (url: string) => void;
  userIndustries: string[];
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick: () => void;
  isChannelFollowed: (channelId: string) => boolean;
  isChannelLoading: (channelId: string) => boolean;
  onFollowToggle?: (channelId: string, currentlyFollowed: boolean) => Promise<void>;
}

const SwipeContainer = React.forwardRef<HTMLDivElement, SwipeContainerProps>(
  ({
    Bytes,
    positions,
    onSave,
    onLike,
    onShare,
    onInfluencerClick,
    onSourceClick,
    userIndustries,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onClick,
    isChannelFollowed,
    isChannelLoading,
    onFollowToggle
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
        {Bytes.map((insight, index) => (
          <InsightCard 
            key={insight.id}
            insight={insight}
            onSave={onSave}
            onLike={onLike}
            onShare={onShare}
            onInfluencerClick={onInfluencerClick}
            onSourceClick={onSourceClick}
            position={positions[index] || ""}
            userIndustries={userIndustries}
            isChannelFollowed={isChannelFollowed(insight.influencer.channel_id)}
            isChannelLoading={isChannelLoading(insight.influencer.channel_id)}
            onFollowToggle={onFollowToggle}
          />
        ))}
      </div>
    );
  }
);

SwipeContainer.displayName = "SwipeContainer";

export default SwipeContainer;