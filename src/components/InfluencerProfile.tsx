
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface Influencer {
  id: string;
  name: string;
  profileImage: string;
  bio: string;
  industry: string;
  followerCount: number;
  engagementScore: number;
  isFollowed: boolean;
  recentBytes: {
    id: string;
    title: string;
    summary: string;
    image: string;
  }[];
}

interface InfluencerProfileProps {
  influencer: Influencer;
  onFollowToggle: (id: string) => void;
  onInsightClick: (insightId: string) => void;
  onBack: () => void;
}

export const InfluencerProfile = ({
  influencer,
  onFollowToggle,
  onInsightClick,
  onBack,
}: InfluencerProfileProps) => {
  const handleFollowToggle = () => {
    onFollowToggle(influencer.id);
    
    toast({
      title: influencer.isFollowed 
        ? `Unfollowed ${influencer.name}`
        : `Following ${influencer.name}`,
      description: influencer.isFollowed 
        ? "You won't see their content in your feed"
        : "You'll see their Bytes in your feed",
    });
  };
  
  return (
    <div className="page-container p-4 animate-fade-in overflow-y-auto">
      {/* Back button */}
      <button 
        className="mb-4 text-sm flex items-center text-muted-foreground"
        onClick={onBack}
      >
        ← Back
      </button>
      
      {/* Influencer Header */}
      <div className="mb-6">
        <div className="flex items-center">
          {/* <img 
            src={influencer.profileImage}
            alt={influencer.name}
            className="w-20 h-20 rounded-full object-cover mr-4"
          /> */}
          <div>
            <h1 className="text-xl font-bold">{influencer.name}</h1>
            <span className="industry-tag mt-1">{influencer.industry}</span>
          </div>
        </div>
        
        <p className="mt-4 text-gray-700">{influencer.bio}</p>
        
        <div className="flex justify-between mt-4 mb-5">
          <div>
            <div className="text-lg font-semibold">{influencer.followerCount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{influencer.engagementScore}</div>
            <div className="text-xs text-muted-foreground">Engagement Score</div>
          </div>
          <div className="flex-grow"></div>
        </div>
        
        <Button
          onClick={handleFollowToggle}
          variant={influencer.isFollowed ? "outline" : "default"}
          className="w-full"
        >
          {influencer.isFollowed ? "Following" : "Follow"}
        </Button>
      </div>
      
      {/* Recent Bytes */}
      <div>
        <h2 className="font-semibold mb-4">Recent Bytes</h2>
        
        <div className="space-y-4">
          {influencer.recentBytes.map(insight => (
            <div 
              key={insight.id}
              className="border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onInsightClick(insight.id)}
            >
              <div className="relative h-32">
                <img 
                  src={insight.image}
                  alt={insight.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{insight.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;
