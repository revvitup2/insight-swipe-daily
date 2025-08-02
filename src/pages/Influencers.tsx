import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Loader2, Plus, X, AlertTriangle } from "lucide-react";
import { useFollowChannel } from "@/hooks/use-follow";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { fetchInfluencersList } from "@/lib/api";
import { useAuthActions } from "@/contexts/authUtils";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { searchYouTubeChannels, addPersonalizedChannel, YouTubeChannel } from "@/lib/api/youtube";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SignUp from "@/components/SignUpComponent";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAddingInfluencer, setIsAddingInfluencer] = useState(false);
  const [urlError, setUrlError] = useState("");
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { isDarkMode } = useTheme();
  const { toggleFollowChannel, isChannelFollowed, isChannelLoading,refreshFollowedChannels,isGlobalLoading } = useFollowChannel(token);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [youtubeSearchTerm, setYoutubeSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState<YouTubeChannel[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null);
const [showConfirmation, setShowConfirmation] = useState(false);
const [isAddingChannel, setIsAddingChannel] = useState(false);

// Add this useEffect for debounced YouTube search
useEffect(() => {
  const delayDebounceFn = setTimeout(async () => {
    if (youtubeSearchTerm.length >= 3) {
      try {
        setIsSearching(true);
        const results = await searchYouTubeChannels(youtubeSearchTerm, 5, token);
        setSearchResults(results);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to search YouTube channels",
          variant: "destructive",
        });
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, 500);

  return () => clearTimeout(delayDebounceFn);
}, [youtubeSearchTerm, token]);

// Add this function to handle channel selection
const handleChannelSelect = (channel: YouTubeChannel) => {
  setSelectedChannel(channel);
  setShowConfirmation(true);
};

// Add this function to handle adding the channel
const handleAddChannelConfirm = async () => {
  if (!selectedChannel || !token) return;

  setIsAddingChannel(true);
  try {
    const result = await addPersonalizedChannel(selectedChannel.channel_id, token);
    
    if (result.status === "exists") {
      toast({
        title: "Channel Exists",
        description: "This channel is already in your personalized feed",
      });
    } else {
      toast({
        title: "Success",
        description: "Channel added successfully! It will be available in your feed shortly.",
      });
    }
    
    setShowConfirmation(false);
    setSelectedChannel(null);
    setYoutubeSearchTerm("");
    setSearchResults([]);
    
    // Refresh the influencers list
    setSkip(0);
       refreshFollowedChannels();
    loadInfluencers(true);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to add channel",
      variant: "destructive",
    });
  } finally {
    setIsAddingChannel(false);
  }
};


  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const handleAddInfluencer = async () => {
    if (!youtubeUrl.trim()) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      setUrlError("Please enter a valid YouTube URL (e.g., https://youtube.com/channel/... or https://youtu.be/...)");
      return;
    }

    setUrlError("");
    setIsAddingInfluencer(true);

    try {
      const response = await fetch(`${API_BASE_URL}/influencers/add-from-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          youtube_url: youtubeUrl,
          search_query: searchTerm 
        }),
      });

      if (response.ok) {
        const newInfluencer = await response.json();
        toast({
          title: "Success",
          description: "Influencer added successfully! They will be processed and available soon.",
        });
        setYoutubeUrl("");
        setShowAddForm(false);
        setSearchTerm("");
        // Refresh the list after adding
        setSkip(0);
        loadInfluencers(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.detail || "Failed to add influencer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding influencer:', error);
      toast({
        title: "Error",
        description: "Failed to add influencer",
        variant: "destructive",
      });
    } finally {
      setIsAddingInfluencer(false);
    }
  };

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
          <SignUp/>
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


        {/* Search Input and Add Influencer Button */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search influencers by name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4" />
            Add Influencer
          </Button>
        </div>

        {showAddForm && (
  <Card className={cn(
    "border-dashed mb-6",
    isDarkMode ? "border-accent" : "border-muted"
  )}>
    <CardContent className="p-4">
      <div className="flex items-center space-x-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <p className="text-sm font-medium">Add New Influencer</p>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Search for a YouTube channel to add to your personalized feed.
      </p>

      <div className="space-y-3">
        <div>
          <Input
            placeholder="Search for a YouTube channel..."
            value={youtubeSearchTerm}
            onChange={(e) => {
              setYoutubeSearchTerm(e.target.value);
              setUrlError("");
            }}
          />
          {urlError && (
            <p className="text-sm text-destructive mt-1">{urlError}</p>
          )}
          
          {/* Search results dropdown */}
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
          
          {!isSearching && searchResults.length > 0 && (
            <div className="mt-2 border rounded-lg overflow-hidden">
              {searchResults.map((channel) => (
                <div
                  key={channel.channel_id}
                  className="p-3 hover:bg-accent cursor-pointer flex items-center gap-3"
                  onClick={() => handleChannelSelect(channel)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={channel.profile_picture} />
                    <AvatarFallback>
                      {channel.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{channel.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel.subscribers.toLocaleString()} subscribers
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)}
<Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add to Personalized Feed</DialogTitle>
      <DialogDescription>
        Are you sure you want to add this channel to your personalized feed?
      </DialogDescription>
    </DialogHeader>
    
    {selectedChannel && (
      <div className="flex items-center gap-4 py-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={selectedChannel.profile_picture} />
          <AvatarFallback>
            {selectedChannel.display_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">{selectedChannel.display_name}</h4>
          <p className="text-sm text-muted-foreground">
            {selectedChannel.subscribers.toLocaleString()} subscribers
          </p>
          {selectedChannel.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {selectedChannel.description}
            </p>
          )}
        </div>
      </div>
    )}
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowConfirmation(false)}
        disabled={isAddingChannel}
      >
        Cancel
      </Button>
      <Button
        onClick={handleAddChannelConfirm}
        disabled={isAddingChannel}
      >
        {isAddingChannel ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        Add Channel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{isGlobalLoading && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-background p-4 rounded-lg flex items-center gap-2">
      <Loader2 className="w-6 h-6 animate-spin" />
      <span>Updating your followed channels...</span>
    </div>
  </div>
)}


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