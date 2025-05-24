
"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExploreInfluencer {
  id: string;
  name: string;
  profileImage: string;
  industry: string;
  bio: string;
  followers: number;
  isFollowed: boolean;
}

interface ExploreCategory {
  id: string;
  name: string;
  icon: string;
  influencers: ExploreInfluencer[];
}

const exploreCategories: ExploreCategory[] = [
  {
    id: "trending",
    name: "Hot Today 🔥",
    icon: "🔥",
    influencers: [
      {
        id: "e1",
        name: "Emma Wilson",
        profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100",
        industry: "Finance",
        bio: "Finance strategist breaking down complex market trends",
        followers: 542000,
        isFollowed: false
      },
      {
        id: "e2",
        name: "James Rivera",
        profileImage: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=100",
        industry: "Technology",
        bio: "Tech analyst focusing on emerging market innovations",
        followers: 328000,
        isFollowed: false
      },
      {
        id: "e3",
        name: "Kate Phillips",
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100",
        industry: "Marketing",
        bio: "Marketing genius with insights on consumer behavior",
        followers: 189000,
        isFollowed: false
      }
    ]
  },
  {
    id: "emerging",
    name: "Emerging Voices 🚀",
    icon: "🚀",
    influencers: [
      {
        id: "e4",
        name: "Ryan Chang",
        profileImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=100",
        industry: "Startups",
        bio: "Startup founder sharing the journey of building companies",
        followers: 78000,
        isFollowed: false
      },
      {
        id: "e5",
        name: "Leila Ahmed",
        profileImage: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?q=80&w=100",
        industry: "Design",
        bio: "Design thinker exploring the intersection of art and function",
        followers: 92000,
        isFollowed: false
      },
      {
        id: "e6",
        name: "Daniel Park",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100",
        industry: "Business",
        bio: "Business strategist with a focus on sustainable growth",
        followers: 67000,
        isFollowed: false
      }
    ]
  },
  {
    id: "ai",
    name: "Leaders in AI 💡",
    icon: "💡",
    influencers: [
      {
        id: "i1",
        name: "Alex Chen",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100",
        industry: "AI",
        bio: "AI researcher and tech entrepreneur. Former lead at DeepMind.",
        followers: 248500,
        isFollowed: false
      },
      {
        id: "e7",
        name: "Sophia Williams",
        profileImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100",
        industry: "AI",
        bio: "AI ethics researcher focusing on responsible deployment",
        followers: 156000,
        isFollowed: false
      },
      {
        id: "e8",
        name: "Marcus Johnson",
        profileImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=100",
        industry: "AI",
        bio: "Machine learning engineer demystifying complex AI concepts",
        followers: 203000,
        isFollowed: false
      }
    ]
  },
  {
    id: "healthcare",
    name: "Healthcare Trailblazers 🏥",
    icon: "🏥",
    influencers: [
      {
        id: "i4",
        name: "Dr. Lisa Patel",
        profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100",
        industry: "Healthcare",
        bio: "Physician and healthcare innovator focused on preventive medicine",
        followers: 187000,
        isFollowed: false
      },
      {
        id: "e9",
        name: "Dr. Robert Kim",
        profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100",
        industry: "Healthcare",
        bio: "Neuroscientist sharing breakthroughs in brain research",
        followers: 134000,
        isFollowed: false
      },
      {
        id: "e10",
        name: "Dr. Amara Nelson",
        profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=100",
        industry: "Healthcare",
        bio: "Public health expert analyzing global health trends",
        followers: 159000,
        isFollowed: false
      }
    ]
  }
];

const Explore = () => {
  const [categories, setCategories] = useState(exploreCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExploreInfluencer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [platform, setPlatform] = useState<string>("youtube");
  const [profileUrl, setProfileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFollowToggle = (categoryId: string, influencerId: string) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          influencers: category.influencers.map(influencer => {
            if (influencer.id === influencerId) {
              return {...influencer, isFollowed: !influencer.isFollowed};
            }
            return influencer;
          })
        };
      }
      return category;
    }));
    
    const category = categories.find(c => c.id === categoryId);
    const influencer = category?.influencers.find(i => i.id === influencerId);
    
    if (influencer) {
      toast({
        title: influencer.isFollowed 
          ? `Unfollowed ${influencer.name}`
          : `Following ${influencer.name}`,
        description: influencer.isFollowed 
          ? "You won't see their content in your feed"
          : "You'll see their insights in your feed",
      });
    }
  };
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulated search results - in a real app, this would query your API
    setTimeout(() => {
      const allInfluencers = categories.flatMap(category => category.influencers);
      
      const results = allInfluencers.filter(influencer => 
        influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        influencer.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        influencer.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(results);
      setIsSearching(false);
      
      if (results.length === 0) {
        setShowSuggestForm(true);
        toast({
          title: "No results found",
          description: "Would you like to suggest a new influencer?",
        });
      }
    }, 1000);
  };
  
  const handleSuggestInfluencer = () => {
    if (!profileUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter a profile URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Thank you for your suggestion!",
        description: "We'll review this influencer and add them to our platform soon.",
      });
      
      setShowSuggestForm(false);
      setProfileUrl("");
      setIsSubmitting(false);
    }, 1500);
  };
  
  const handleFollowSearchResult = (influencerId: string) => {
    setSearchResults(searchResults.map(influencer => {
      if (influencer.id === influencerId) {
        return {...influencer, isFollowed: !influencer.isFollowed};
      }
      return influencer;
    }));
    
    // Also update in main categories
    setCategories(categories.map(category => ({
      ...category,
      influencers: category.influencers.map(influencer => {
        if (influencer.id === influencerId) {
          const updatedInfluencer = {...influencer, isFollowed: !influencer.isFollowed};
          
          // Show toast
          toast({
            title: updatedInfluencer.isFollowed 
              ? `Following ${updatedInfluencer.name}`
              : `Unfollowed ${updatedInfluencer.name}`,
            description: updatedInfluencer.isFollowed 
              ? "You'll see their insights in your feed"
              : "You won't see their content in your feed",
          });
          
          return updatedInfluencer;
        }
        return influencer;
      })
    })));
  };
  
  return (
    <div className="page-container bg-background">
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-4">ByteMe - Explore</h1>
        
        {/* Search Section */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for influencers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-4">
              <h2 className="font-semibold">Search Results</h2>
              {searchResults.map(influencer => (
                <div key={influencer.id} className="influencer-card">
                  <div className="w-20 h-20 mr-4">
                    <img 
                      src={influencer.profileImage}
                      alt={influencer.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{influencer.name}</h3>
                      <span className="industry-tag">{influencer.industry}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {influencer.bio}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {influencer.followers.toLocaleString()} followers
                      </span>
                      
                      <Button
                        variant={influencer.isFollowed ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleFollowSearchResult(influencer.id)}
                        className="text-xs"
                      >
                        {influencer.isFollowed ? "Following" : "Follow"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Suggest New Influencer Form */}
          {showSuggestForm && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Suggest a New Influencer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Can't find who you're looking for? Suggest them to be added:
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Profile URL</label>
                    <Input
                      value={profileUrl}
                      onChange={(e) => setProfileUrl(e.target.value)}
                      placeholder="https://youtube.com/channel/..."
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSuggestInfluencer} 
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Suggest Influencer
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSuggestForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Categories Tabs */}
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="trending">🔥</TabsTrigger>
            <TabsTrigger value="emerging">🚀</TabsTrigger>
            <TabsTrigger value="ai">💡</TabsTrigger>
            <TabsTrigger value="healthcare">🏥</TabsTrigger>
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
              
              <div className="space-y-4">
                {category.influencers.map(influencer => (
                  <div key={influencer.id} className="influencer-card">
                    <div className="w-20 h-20 mr-4">
                      <img 
                        src={influencer.profileImage}
                        alt={influencer.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{influencer.name}</h3>
                        <span className="industry-tag">{influencer.industry}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {influencer.bio}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {influencer.followers.toLocaleString()} followers
                        </span>
                        
                        <Button
                          variant={influencer.isFollowed ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowToggle(category.id, influencer.id)}
                          className="text-xs"
                        >
                          {influencer.isFollowed ? "Following" : "Follow"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Explore;
