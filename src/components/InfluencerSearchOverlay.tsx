import { useState, useEffect } from "react";
import { Search, Plus, X, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useFollowChannel } from "@/hooks/use-follow";

interface Influencer {
  id: string;
  display_name: string;
  channel_id: string;
  industry: string;
  platform: string;
  avatar_url?: string;
}

const mockInfluencers = [
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

interface InfluencerSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onInfluencerSelect?: (influencer: Influencer) => void;
}

export const InfluencerSearchOverlay = ({ 
  isOpen, 
  onClose, 
  onInfluencerSelect 
}: InfluencerSearchOverlayProps) => {
  const { token } = useAuth();
  const { isDarkMode } = useTheme();
  const { toggleFollowChannel, isChannelFollowed, isChannelLoading } = useFollowChannel(token);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Influencer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isAddingInfluencer, setIsAddingInfluencer] = useState(false);
  const [urlError, setUrlError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const isValidYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const searchInfluencers = async (query: string) => {
    if (!token || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/influencers/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching influencers:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchInfluencers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
          search_query: searchQuery 
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
        setSearchQuery("");
        
        if (onInfluencerSelect) {
          onInfluencerSelect(newInfluencer);
        }
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

  const handleFollow = async (influencerId: string, influencerName: string) => {
    const currentlyFollowed = isChannelFollowed(influencerId);
    const result = await toggleFollowChannel(influencerId, currentlyFollowed);
    
    if (result.success) {
      toast({
        title: currentlyFollowed ? "Unfollowed" : "Following",
        description: `${currentlyFollowed ? "Unfollowed" : "Now following"} ${influencerName}`,
      });
    }
  };

  const filteredMockInfluencers = mockInfluencers.filter((influencer) =>
    influencer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-primary">Search Influencers</h2>
              <p className="text-sm text-muted-foreground">Find and follow industry experts</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for influencers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Add Influencer Button */}
          <Button
            variant="ghost" 
            className="w-full justify-start text-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Influencer
          </Button>

          {/* Add Influencer Form */}
          {showAddForm && (
            <Card className={cn(
              "border-dashed",
              isDarkMode ? "border-accent" : "border-muted"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <p className="text-sm font-medium">Add New Influencer</p>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Add an influencer by providing their YouTube channel URL.
                </p>

                <div className="space-y-3">
                  <div>
                    <Input
                      placeholder="Enter YouTube channel/video URL..."
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        setUrlError("");
                      }}
                      className={cn(
                        urlError ? "border-destructive" : ""
                      )}
                    />
                    {urlError && (
                      <p className="text-sm text-destructive mt-1">{urlError}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddInfluencer}
                      disabled={isAddingInfluencer}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>
                        {isAddingInfluencer ? "Adding..." : "Add Influencer"}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Search Results:</p>
              {searchResults.map((influencer) => (
                <Card 
                  key={influencer.id} 
                  className={cn(
                    "cursor-pointer hover:bg-accent transition-colors",
                    isDarkMode ? "hover:bg-accent/50" : ""
                  )}
                  onClick={() => onInfluencerSelect?.(influencer)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      {influencer.avatar_url && (
                        <img 
                          src={influencer.avatar_url} 
                          alt={influencer.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{influencer.display_name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {influencer.platform}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {influencer.industry}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Mock Influencers List */}
          {(!searchQuery.trim() || searchResults.length === 0) && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {searchQuery.trim() ? "Suggested Influencers:" : "Popular Influencers:"}
              </p>
              <div className="grid grid-cols-1 gap-3">
                {filteredMockInfluencers.map((influencer) => {
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
          )}
        </div>
      </div>
    </div>
  );
};