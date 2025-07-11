
import { InfluencersList } from "./InfluencersList";

interface EmptyFollowingStateProps {
  onFollowChange?: () => void;
}

export const EmptyFollowingState = ({ onFollowChange }: EmptyFollowingStateProps) => {
  return (
    <div className="flex flex-col h-full p-4">
      <InfluencersList onFollowChange={onFollowChange} />
    </div>
  );
};