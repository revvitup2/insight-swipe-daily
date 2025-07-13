import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Loader2 } from "lucide-react";
import { useFollowChannel } from "@/hooks/use-follow";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { fetchInfluencersList } from "@/lib/api";
import { useAuthActions } from "@/contexts/authUtils";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
interface Influencer {
  channel_id: string;
  display_name: string;
  profile_picture: string;
  industry: string;
  industry_type: string;
  platform: string;
  subscribers: number;
}

interface InfluencersResponse {
  items: Influencer[];
  total: number;
  skip: number;
  limit: number;
}

const ITEMS_PER_PAGE = 10;

const Influencers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
    const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toggleFollowChannel, isChannelFollowed, isChannelLoading } = useFollowChannel(token);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Load initial influencers
  const loadInfluencers = useCallback(async (reset: boolean = false) => {
    if (!token) return;
    
    try {
      const currentSkip = reset ? 0 : skip;
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const data = await fetchInfluencersList(token, currentSkip, ITEMS_PER_PAGE);
      
      if (reset) {
        setInfluencers(data.items);
        setSkip(ITEMS_PER_PAGE);
      } else {
        setInfluencers(prev => [...prev, ...data.items]);
        setSkip(prev => prev + ITEMS_PER_PAGE);
      }

      // Check if there are more items to load
      setHasMore(data.items.length === ITEMS_PER_PAGE);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load influencers');
      toast({
        title: "Error",
        description: "Failed to load influencers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token, skip]);

  // Initial load
  useEffect(() => {
    loadInfluencers(true);
  }, [token]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore && !loading) {
          loadInfluencers(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loadingMore, loading, loadInfluencers]);

  // Filter influencers based on search term
  const filteredInfluencers = influencers.filter((influencer) =>
    influencer.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.industry_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFollow = async (influencerId: string, influencerName: string) => {
    const currentlyFollowed = isChannelFollowed(influencerId);
    const result = await toggleFollowChannel(influencerId, currentlyFollowed);
    
    if (result.success) {
      toast({
        title: "Success",
        description: `${currentlyFollowed ? 'Unfollowed' : 'Followed'} ${influencerName}`,
      });
    }
  };
    const { handleGoogleSignIn } = useAuthActions();

  const handleRefresh = () => {
    setSkip(0);
    loadInfluencers(true);
  };

  if (!token) {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-6">You need to sign in to view and follow influencers</p>
          <Button onClick={handleGoogleSignIn}>Sign In with Google</Button>
        </div>
      </div>
    </div>
  );
}

  if (loading && influencers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Discover Influencers</h1>
              <p className="text-muted-foreground">Find and follow industry experts</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error && influencers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Discover Influencers</h1>
              <p className="text-muted-foreground">Find and follow industry experts</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-muted-foreground text-center">Failed to load influencers</p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Discover Influencers</h1>
            <p className="text-muted-foreground">Find and follow industry experts</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInfluencers.map((influencer) => {
            const isFollowed = isChannelFollowed(influencer.channel_id);
            const isLoading = isChannelLoading(influencer.channel_id);
            
            return (
              <Card key={influencer.channel_id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={influencer.profile_picture}
                      alt={influencer.display_name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/api/placeholder/48/48';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{influencer.display_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {influencer.subscribers.toLocaleString()} subscribers
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {/* <Badge variant="secondary" className="text-xs">
                      {influencer.industry_type}
                    </Badge> */}
                    <Badge variant="outline" className="text-xs">
                      {influencer.platform}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    variant={isFollowed ? "destructive" : "default"}
                    size="sm"
                    className="w-full"
                    onClick={() => handleFollow(influencer.channel_id, influencer.display_name)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      isFollowed ? "Unfollow" : "Follow"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Intersection observer target */}
        <div ref={observerRef} className="h-4" />

        {/* No more items indicator */}
        {!hasMore && filteredInfluencers.length > 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No more influencers to load
          </div>
        )}

        {/* No results found */}
        {searchTerm && filteredInfluencers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No influencers found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !searchTerm && filteredInfluencers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No influencers available</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              Refresh
            </Button>
          </div>
        )}
      </div>
      <div className="fixed bottom-4 left-0 right-0 flex justify-center">
  <Button 
    onClick={() => navigate("/", { state: { activeTab: "following" } })}
    className="w-[90%] md:w-[40%] py-6 text-lg font-semibold"
  >
    <Save className="mr-2 h-5 w-5" />
    Save
  </Button>
</div>
    </div>
  );
};

export default Influencers;