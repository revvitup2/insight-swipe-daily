import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";

interface Influencer {
  id: string;
  name: string;
  industry: string;
  followerCount: number;
  profileImage: string;
  isFollowed: boolean;
}

const mockInfluencers: Influencer[] = [
  {
    id: "1",
    name: "Elon Musk",
    industry: "Technology",
    followerCount: 120000000,
    profileImage: "https://pbs.twimg.com/profile_images/1685664445849899008/99wW5_Xo_400x400.jpg",
    isFollowed: false,
  },
  {
    id: "2",
    name: "Bill Gates",
    industry: "Technology",
    followerCount: 60000000,
    profileImage: "https://pbs.twimg.com/profile_images/1541984345234993152/OUHwzkvV_400x400.jpg",
    isFollowed: true,
  },
  {
    id: "3",
    name: "Gary Vaynerchuk",
    industry: "Marketing",
    followerCount: 10000000,
    profileImage: "https://pbs.twimg.com/profile_images/1398493874902149122/q-c8jHPU_400x400.jpg",
    isFollowed: false,
  },
  {
    id: "4",
    name: "Lex Fridman",
    industry: "AI",
    followerCount: 2000000,
    profileImage: "https://pbs.twimg.com/profile_images/1478999754395729922/c4W_1aPj_400x400.jpg",
    isFollowed: true,
  },
  {
    id: "5",
    name: "Huberman Lab",
    industry: "Healthcare",
    followerCount: 1000000,
    profileImage: "https://pbs.twimg.com/profile_images/1472983540253429765/UpB_K0cd_400x400.jpg",
    isFollowed: false,
  },
];

const Influencers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [followedInfluencers, setFollowedInfluencers] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Load followed influencers from localStorage
    const storedFollowed = localStorage.getItem("followedInfluencers");
    if (storedFollowed) {
      setFollowedInfluencers(new Set(JSON.parse(storedFollowed)));
    }
  }, []);

  useEffect(() => {
    // Save followed influencers to localStorage
    localStorage.setItem("followedInfluencers", JSON.stringify(Array.from(followedInfluencers)));
  }, [followedInfluencers]);

  const toggleFollow = (influencerId: string) => {
    setFollowedInfluencers((prev) => {
      const newFollowed = new Set(prev);
      if (newFollowed.has(influencerId)) {
        newFollowed.delete(influencerId);
      } else {
        newFollowed.add(influencerId);
      }
      return newFollowed;
    });
  };

  const filteredInfluencers = mockInfluencers.filter((influencer) =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search influencers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Influencer Cards */}
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
                {/* <img
                  src={influencer.profileImage}
                  alt={influencer.name}
                  className="rounded-full w-20 h-20 mx-auto mb-4"
                /> */}
                <Button
                  variant={followedInfluencers.has(influencer.id) ? "destructive" : "outline"}
                  className="w-full"
                  onClick={() => {
                    toggleFollow(influencer.id);
                    toast({
                      title: followedInfluencers.has(influencer.id) ? "Unfollowed" : "Followed",
                      description: `You have ${followedInfluencers.has(influencer.id) ? "unfollowed" : "followed"} ${influencer.name}.`,
                    });
                  }}
                >
                  {followedInfluencers.has(influencer.id) ? "Unfollow" : "Follow"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Influencers;