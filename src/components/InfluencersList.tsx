import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import { useFollowChannel } from "@/hooks/use-follow";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Influencer {
  id: string;
  name: string;
  industry: string;
  followerCount: number;
  profileImage: string;
}

const mockInfluencers: Influencer[] = [
  {
    id: "1",
    name: "Bill Gates",
    industry: "Technology",
    followerCount: 60000000,
    profileImage: "https://pbs.twimg.com/profile_images/1541984345234993152/OUHwzkvV_400x400.jpg",
  },
  {
    id: "2",
    name: "Elon Musk",
    industry: "Technology",
    followerCount: 120000000,
    profileImage: "https://pbs.twimg.com/profile_images/1685664445849899008/99wW5_Xo_400x400.jpg",
  },
  {
    id: "3",
    name: "Gary Vaynerchuk",
    industry: "Marketing",
    followerCount: 10000000,
    profileImage: "https://pbs.twimg.com/profile_images/1398493874902149122/q-c8jHPU_400x400.jpg",
  },
  {
    id: "4",
    name: "Huberman Lab",
    industry: "Healthcare",
    followerCount: 1000000,
    profileImage: "https://pbs.twimg.com/profile_images/1472983540253429765/UpB_K0cd_400x400.jpg",
  },
  {
    id: "5",
    name: "Lex Fridman",
    industry: "AI",
    followerCount: 2000000,
    profileImage: "https://pbs.twimg.com/profile_images/1478999754395729922/c4W_1aPj_400x400.jpg",
  },
].sort((a, b) => a.name.localeCompare(b.name));

interface InfluencersListProps {
  onFollowChange?: () => void;
}

export const InfluencersList = ({ onFollowChange }: InfluencersListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, token } = useAuth();
  const { toggleFollowChannel, isChannelFollowed, isChannelLoading } = useFollowChannel(token);

  const filteredInfluencers = mockInfluencers.filter((influencer) =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFollow = async (influencerId: string, influencerName: string) => {
    const currentlyFollowed = isChannelFollowed(influencerId);
    const result = await toggleFollowChannel(influencerId, currentlyFollowed);
    
    if (result.success && onFollowChange) {
      onFollowChange();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-primary">Discover Influencers</h2>
          <p className="text-sm text-muted-foreground">Find and follow industry experts</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search influencers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Influencer Cards */}
      <div className="grid grid-cols-1 gap-3 overflow-y-auto">
        {filteredInfluencers.map((influencer) => {
          const isFollowed = isChannelFollowed(influencer.id);
          const isLoading = isChannelLoading(influencer.id);
          
          return (
            <Card key={influencer.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{influencer.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{influencer.industry}</Badge>
                </div>
                <CardDescription className="text-sm">
                  {influencer.followerCount.toLocaleString()} Followers
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant={isFollowed ? "destructive" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleFollow(influencer.id, influencer.name)}
                  disabled={isLoading}
                >
                  {isLoading ? "..." : (isFollowed ? "Unfollow" : "Follow")}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};