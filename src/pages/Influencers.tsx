
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { useFollowChannel } from "@/hooks/use-follow";
import { useAuth } from "@/contexts/AuthContext";

interface Influencer {
  id: string;
  name: string;
  industry: string;
  followerCount: number;
  profileImage: string;
  channel_id: string;
}

const mockInfluencers: Influencer[] = [
  {
    id: "1",
    name: "Elon Musk",
    industry: "Technology",
    followerCount: 120000000,
    profileImage: "https://pbs.twimg.com/profile_images/1685664445849899008/99wW5_Xo_400x400.jpg",
    channel_id: "elon_musk_channel",
  },
  {
    id: "2", 
    name: "Bill Gates",
    industry: "Technology",
    followerCount: 60000000,
    profileImage: "https://pbs.twimg.com/profile_images/1541984345234993152/OUHwzkvV_400x400.jpg",
    channel_id: "bill_gates_channel",
  },
  {
    id: "3",
    name: "Gary Vaynerchuk",
    industry: "Marketing",
    followerCount: 10000000,
    profileImage: "https://pbs.twimg.com/profile_images/1398493874902149122/q-c8jHPU_400x400.jpg",
    channel_id: "gary_vee_channel",
  },
  {
    id: "4",
    name: "Lex Fridman",
    industry: "AI",
    followerCount: 2000000,
    profileImage: "https://pbs.twimg.com/profile_images/1478999754395729922/c4W_1aPj_400x400.jpg",
    channel_id: "lex_fridman_channel",
  },
  {
    id: "5",
    name: "Huberman Lab",
    industry: "Healthcare",
    followerCount: 1000000,
    profileImage: "https://pbs.twimg.com/profile_images/1472983540253429765/UpB_K0cd_400x400.jpg",
    channel_id: "huberman_lab_channel",
  },
];

const Influencers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const {
    toggleFollowChannel,
    isChannelFollowed,
    isChannelLoading,
    initializeFollowedChannels,
  } = useFollowChannel(token);

  // Initialize followed channels on component mount
  useEffect(() => {
    if (token) {
      initializeFollowedChannels();
    }
  }, [token, initializeFollowedChannels]);

  // Debounce search term
  const debouncedSearch = useDebounce((term: string) => {
    setDebouncedSearchTerm(term);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const handleFollowToggle = async (channelId: string) => {
    const currentlyFollowed = isChannelFollowed(channelId);
    await toggleFollowChannel(channelId, currentlyFollowed);
  };

  const filteredInfluencers = mockInfluencers.filter((influencer) =>
    influencer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    influencer.industry.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-12 px-4 pb-20 md:pb-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Influencers</h1>
            <p className="text-muted-foreground">Discover and follow industry experts</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search influencers by name or industry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Influencer Cards */}
        {filteredInfluencers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No influencers found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((influencer) => (
              <Card key={influencer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {influencer.name}
                    <Badge variant="secondary">{influencer.industry}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {influencer.followerCount.toLocaleString()} Followers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant={isChannelFollowed(influencer.channel_id) ? "destructive" : "default"}
                    className="w-full"
                    disabled={isChannelLoading(influencer.channel_id)}
                    onClick={() => handleFollowToggle(influencer.channel_id)}
                  >
                    {isChannelLoading(influencer.channel_id) 
                      ? "Loading..." 
                      : isChannelFollowed(influencer.channel_id) 
                        ? "Unfollow" 
                        : "Follow"
                    }
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Influencers;
