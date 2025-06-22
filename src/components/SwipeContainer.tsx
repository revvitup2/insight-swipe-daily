
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InsightCard, { Insight } from '@/components/InsightCard';

interface SwipeContainerProps {
  insights: Insight[];
  currentIndex: number;
  direction: number;
  onSave: (id: string) => void;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onInfluencerClick: (influencerId: string) => void;
  onSourceClick: (url: string) => void;
  userIndustries: string[];
  isChannelFollowed: (channelId: string) => boolean;
  isChannelLoading: (channelId: string) => boolean;
  onFollowToggle: (channelId: string, currentlyFollowed: boolean) => Promise<void>;
}

const SwipeContainer: React.FC<SwipeContainerProps> = ({
  insights,
  currentIndex,
  direction,
  onSave,
  onLike,
  onShare,
  onInfluencerClick,
  onSourceClick,
  userIndustries,
  isChannelFollowed,
  isChannelLoading,
  onFollowToggle,
}) => {
  if (!insights.length || currentIndex >= insights.length) {
    return null;
  }

  const currentInsight = insights[currentIndex];

  return (
    <div className="swipe-container h-full w-full relative overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentInsight.id}
          custom={direction}
          initial={{ y: direction === 1 ? 100 : -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction === 1 ? -100 : 100, opacity: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className="h-full w-full"
        >
          <InsightCard
            key={currentInsight.id}
            insight={currentInsight}
            onSave={onSave}
            onLike={onLike}
            onShare={onShare}
            onInfluencerClick={onInfluencerClick}
            onSourceClick={onSourceClick}
            position=""
            userIndustries={userIndustries}
            isChannelFollowed={isChannelFollowed(currentInsight.influencer.channel_id)}
            isChannelLoading={isChannelLoading(currentInsight.influencer.channel_id)}
            onFollowToggle={onFollowToggle}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SwipeContainer;
