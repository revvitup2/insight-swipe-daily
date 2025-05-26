"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { Search, Heart, Share, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CURRENT_INSIGHT_VERSION } from "@/constants/constants";
import ByteMeLogo from "@/components/ByteMeLogo";
import { PlatformIcon } from "@/components/InsightCard";
import { useNavigate } from "react-router-dom";

interface ApiInsight {
  influencer_id: string;
  video_id: string;
  published_at: string;
  industry: string;
  metadata: {
    title: string;
    description: string;
    channel_title: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    tags: string[];
  };
  analysis: {
    summary: string;
    key_points: string[];
    sentiment: string;
    topics: string[];
  };
  source?: {
    platform: "youtube" | "twitter" | "linkedin" | "other";
    url: string;
  };
}

interface ExploreBite {
  id: string;
  title: string;
  summary: string;
  image: string;
  industry: string;
  influencer: {
    id: string;
    name: string;
    profileImage: string;
    isFollowed: boolean;
  };
  publishedAt: string;
  isLiked: boolean;
  isSaved: boolean;
  sourceUrl: string;
  source: "youtube" | "twitter" | "linkedin" | "other";
  keyPoints: string[];
  sentiment: string;
}

export interface VersionedInsight extends ExploreBite {
  version: number;
  savedAt: string;
}

export interface SavedBytesData {
  versions: {
    [version: number]: ExploreBite[];
  };
}

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [Bytes, setBytes] = useState<ExploreBite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch Bytes from API
  useEffect(() => {
    const fetchBytes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed`);
        const data: ApiInsight[] = await response.json();
        
        const formattedBytes: ExploreBite[] = data.map((item) => {
          const sourceUrl = item.source?.url || `https://youtube.com/watch?v=${item.video_id}`;
          let sourcePlatform: "youtube" | "twitter" | "linkedin" | "other" = "youtube";
          
          if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) {
            sourcePlatform = "youtube";
          } else if (sourceUrl.includes('twitter.com') || sourceUrl.includes('x.com')) {
            sourcePlatform = "twitter";
          } else if (sourceUrl.includes('linkedin.com')) {
            sourcePlatform = "linkedin";
          } else {
            sourcePlatform = "other";
          }
          
          // Check if this bite is already saved
          const savedData: SavedBytesData = JSON.parse(
            localStorage.getItem("savedBytes") || '{"versions":{}}'
          );
          const isSaved = Object.values(savedData.versions).some(version => 
            version.some(bite => bite.id === item.video_id)
          );
          
          return {
            id: item.video_id,
            title: item.metadata.title,
            summary: item.analysis.summary,
            image: item.metadata.thumbnails.high.url,
            industry: item.industry || "General",
            influencer: {
              id: item.influencer_id,
              name: item.metadata.channel_title,
              profileImage: "https://ui-avatars.com/api/?name=" + encodeURIComponent(item.metadata.channel_title),
              isFollowed: false
            },
            isSaved,
            isLiked: false,
            publishedAt: new Date(item.published_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            sourceUrl: sourceUrl,
            source: sourcePlatform,
            keyPoints: item.analysis.key_points,
            sentiment: item.analysis.sentiment
          };
        });

        setBytes(formattedBytes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Bytes:", error);
        toast({
          title: "Error",
          description: "Failed to fetch Bytes. Please try again later.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchBytes();
  }, []);

  // Get unique industries for categories
  const categories = useMemo(() => {
    const industrySet = new Set<string>();
    Bytes.forEach(bite => {
      if (bite.industry) {
        industrySet.add(bite.industry);
      }
    });

    const industryCategories = Array.from(industrySet).map(industry => ({
      id: industry.toLowerCase().replace(/\s+/g, '-'),
      name: industry,
      icon: getIndustryIcon(industry)
    }));

    // Add "All" category at the beginning
    return [
      { id: "all", name: "All", icon: "🌟" },
      ...industryCategories
    ];
  }, [Bytes]);

  // Filter Bytes based on selected category and search query
  const filteredBytes = useMemo(() => {
    let filtered = Bytes;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(bite => 
        bite.industry.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(bite => 
        bite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bite.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bite.influencer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedCategory, searchQuery, Bytes]);

  const handleLike = (id: string) => {
    setBytes(prev => prev.map(bite => 
      bite.id === id ? { ...bite, isLiked: !bite.isLiked } : bite
    ));
  };

  const handleSave = (id: string) => {
    setBytes(prevBytes => {
      const updatedBytes = prevBytes.map(insight => {
        if (insight.id === id) {
          return { ...insight, isSaved: !insight.isSaved };
        }
        return insight;
      });

      // Get current saved Bytes data from localStorage
      const savedData: SavedBytesData = JSON.parse(
        localStorage.getItem("savedBytes") || '{"versions":{}}'
      );

      // Find the insight being toggled
      const insightToToggle = updatedBytes.find(i => i.id === id);
      
      if (insightToToggle) {
        // Initialize version if it doesn't exist
        if (!savedData.versions[CURRENT_INSIGHT_VERSION]) {
          savedData.versions[CURRENT_INSIGHT_VERSION] = [];
        }
        
        if (insightToToggle.isSaved) {
          // Add to current version's saved Bytes
          const versionBytes = savedData.versions[CURRENT_INSIGHT_VERSION] || [];
          savedData.versions[CURRENT_INSIGHT_VERSION] = [
            ...versionBytes.filter(i => i.id !== id), // Remove if already exists
            {
              ...insightToToggle,
              savedAt: new Date().toISOString()
            }
          ];
        } else {
          // Remove from current version
          savedData.versions[CURRENT_INSIGHT_VERSION] = 
            (savedData.versions[CURRENT_INSIGHT_VERSION] || [])
              .filter(i => i.id !== id);
        }

        // Update saved Bytes in localStorage
        localStorage.setItem("savedBytes", JSON.stringify(savedData));
      }

      return updatedBytes;
    });

    const isSaved = Bytes.find(i => i.id === id)?.isSaved;
    toast({
      title: isSaved ? "Saved" : "Removed from saved",
      description: isSaved 
        ? `Added to version ${CURRENT_INSIGHT_VERSION} collection` 
        : "Removed from your saved items",
    });
  };

  const handleShare = async (id: string) => {
    const bite = Bytes.find(i => i.id === id);
    if (!bite) return;

    try {
      setIsSharing(true); // Start loading

      // Get the insight card element
      const insightCard = document.querySelector(`[data-insight-id="${id}"]`) as HTMLElement;
      if (!insightCard) {
        setIsSharing(false);
        return;
      }

      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(insightCard, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      if (!blob) {
        setIsSharing(false);
        return;
      }

      const shareUrl = `${window.location.origin}/Bytes/${bite.id}`;
      const shareText = `${bite.title}\n\n${bite.summary.substring(0, 100)}...\n\nTo read more insightful Bytes in less than 60 words, visit: ${shareUrl}`;
      const file = new File([blob], 'insight.png', { type: 'image/png' });

      // Check support for full share with image
      const canShareWithImage = navigator.canShare && navigator.canShare({ files: [file] });

      if (navigator.share) {
        if (canShareWithImage) {
          await navigator.share({
            title: bite.title,
            text: shareText,
            url: shareUrl,
            files: [file],
          });
        } else {
          // Fallback to just text and link if image share isn't supported
          await navigator.share({
            title: bite.title,
            text: shareText,
            url: shareUrl,
          });
        }

      } else {
        // Desktop or unsupported browser fallback
        const imageUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = 'byte-me-insight.png';
        document.body.appendChild(downloadLink);

        toast({
          title: "Share this insight",
          description: (
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center">
                <img 
                  src={imageUrl} 
                  alt={bite.title} 
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
              <p className="text-sm whitespace-pre-wrap">{shareText}</p>
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      downloadLink.click();
                      URL.revokeObjectURL(imageUrl);
                      document.body.removeChild(downloadLink);
                    }}
                  >
                    Download Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareText);
                      toast({
                        title: "Copied to clipboard",
                        description: "Text with link is ready to paste",
                      });
                    }}
                  >
                    Copy Text
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                    }}
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                    }}
                  >
                    Share on LinkedIn
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    window.open(shareUrl, '_blank');
                  }}
                >
                  Open Insight
                </Button>
              </div>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false); // End loading
    }
  };


  // Helper function to get icon for industry
  function getIndustryIcon(industry: string): string {
    const industryLower = industry.toLowerCase();
    if (industryLower.includes('finance') || industryLower.includes('money')) return "💰";
    if (industryLower.includes('tech') || industryLower.includes('ai')) return "🤖";
    if (industryLower.includes('health')) return "🏥";
    if (industryLower.includes('startup')) return "🚀";
    if (industryLower.includes('business')) return "💼";
    if (industryLower.includes('market')) return "📢";
    if (industryLower.includes('design')) return "🎨";
    return "📌";
  }
    const navigate = useNavigate();
  
    const handleClick = (id:string) => {
   navigate(`/Bytes/${id}`);
  };


  if (isLoading) {
    return <LoadingSpinner message="Loading Bytes..." />;
  }

  return (
    <div className="page-container bg-background">
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-4">Explore Bytes</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search Bytes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Bytes Grid */}
        <div className="space-y-4">
          {filteredBytes.map((bite) => (
            <div 
              key={bite.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              data-insight-id={bite.id}
              onClick={(e)=>{handleClick(bite.id)}}
            >
            <div className="sm:w-1/3 relative aspect-video sm:aspect-auto sm:h-full">
                    <img
                      src={bite.image}
                      alt={bite.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* ByteMe Brand Watermark - Top right */}
                    <div className="absolute top-2 right-2">
                      <ByteMeLogo size="sm" className="opacity-80" />
                    </div>
                    
                    {/* Industry Tag - Bottom left with subtle black background */}
                    <div className="absolute bottom-2 left-2 flex items-center bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
                      {bite.industry}
                    </div>
                    
                    {/* Source Platform - Bottom right with subtle black background */}
                    {bite.source && (
                      <div 
                        className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-black/80 transition-colors text-white"
                        // onClick={handleSourceClick}
                      >
                        <PlatformIcon source={bite.source} />
                      </div>
                    )}
                  </div>
                  
              
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <img
                    src={bite.influencer.profileImage}
                    alt={bite.influencer.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {bite.influencer.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {bite.publishedAt}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {bite.title}
                </h3>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {bite.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {bite.industry}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(bite.id);
                      }}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                        bite.isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                      )}
                    >
                      <Heart className={cn("w-5 h-5", bite.isLiked && "fill-current")} />
                    </button> */}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(bite.id);
                      }}
                      className={cn(
                        "p-2 rounded-full transition-colors",
                      "text-gray-400 hover:text-primary"
                      )}
                    >
                      <Save className={cn("w-5 h-5")} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(bite.id);
                      }}
                      className="p-2 rounded-full text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Share className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
      

        {filteredBytes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No Bytes found matching your criteria.</p>
            <Button 
              variant="ghost"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Explore;