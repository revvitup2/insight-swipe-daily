import { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface Influencer {
  id: string;
  display_name: string;
  channel_id: string;
  industry: string;
  platform: string;
  avatar_url?: string;
}

interface InfluencerSearchProps {
  onInfluencerSelect?: (influencer: Influencer) => void;
}

const InfluencerSearch = ({ onInfluencerSelect }: InfluencerSearchProps) => {
  const { token } = useAuth();
  const { isDarkMode } = useTheme();
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
        if (results.length === 0) {
          setShowAddForm(true);
        }
      } else {
        setSearchResults([]);
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error searching influencers:', error);
      setSearchResults([]);
      setShowAddForm(true);
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
        setShowAddForm(false);
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

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search for influencers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
        </div>
      )}

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

      {showAddForm && searchQuery.trim() && (
        <Card className={cn(
          "border-dashed",
          isDarkMode ? "border-accent" : "border-muted"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <p className="text-sm font-medium">Influencer not found</p>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              No influencer found for "{searchQuery}". You can add them by providing their YouTube channel URL.
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
    </div>
  );
};

export default InfluencerSearch;