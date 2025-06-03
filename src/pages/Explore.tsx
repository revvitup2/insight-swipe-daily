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
import { useTheme } from "@/contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";

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
  const { isDarkMode } = useTheme();

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
          // Add to current version's saved Bytes (without savedAt property)
          const versionBytes = savedData.versions[CURRENT_INSIGHT_VERSION] || [];
          savedData.versions[CURRENT_INSIGHT_VERSION] = [
            ...versionBytes.filter(i => i.id !== id), // Remove if already exists
            insightToToggle
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
    setIsSharing(true);

    const insightCard = document.querySelector(`[data-insight-id="${id}"]`) as HTMLElement;
    if (!insightCard) {
      setIsSharing(false);
      return;
    }

    const { toBlob } = await import('html-to-image');
    const blob = await toBlob(insightCard, {
      quality: 0.95,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // Respect dark mode
      cacheBust: true,
    });

    if (!blob) {
      setIsSharing(false);
      return;
    }

    const shareUrl = `${window.location.origin}/Bytes/${bite.id}`;
    const shareText = `${bite.title}\n\n${bite.summary.substring(0, 100)}...\n\nTo read more insightful Bytes in less than 60 words, visit: ${shareUrl}`;
    const file = new File([blob], 'insight.png', { type: 'image/png' });

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
        await navigator.share({
          title: bite.title,
          text: shareText,
          url: shareUrl,
        });
      }
    } else {
      // Desktop fallback with dark mode support
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
                className={cn(
                  "max-w-full h-auto rounded-lg border",
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                )}
              />
            </div>
            <p className={cn(
              "text-sm whitespace-pre-wrap",
              isDarkMode ? "text-gray-300" : "text-gray-700"
            )}>
              {shareText}
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    isDarkMode 
                      ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700" 
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
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
                  className={cn(
                    isDarkMode 
                      ? "border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700" 
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  )}
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
                  className={cn(
                    "border-blue-500 text-blue-500 hover:bg-blue-50",
                    isDarkMode && "hover:bg-blue-900/20"
                  )}
                  onClick={() => {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                  }}
                >
                  Share on Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-blue-600 text-blue-600 hover:bg-blue-50",
                    isDarkMode && "hover:bg-blue-900/20"
                  )}
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
                className={cn(
                  "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
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
    setIsSharing(false);
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
    const getTimeAgo = (publishedAt: string) => {
    return publishedAt 
      ? formatDistanceToNow(new Date(publishedAt), { addSuffix: false })
      : '';
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading Bytes..." />;
  }

  
  return (
    <div className="page-container bg-background">
             {isSharing && (
      <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Preparing share content...</p>
        </div>
      </div>
    )}
      
      <div className="p-4 pb-20 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Explore Bytes</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4 max-w-md">
  <Search className={cn(
    "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
    isDarkMode ? "text-gray-400" : "text-muted-foreground"
  )} />
  <Input
    placeholder="Search Bytes..."
    className={cn(
      "pl-10",
      isDarkMode ? "bg-gray-800 border-gray-700 text-white" : ""
    )}
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
  className={cn(
    "flex items-center gap-1 whitespace-nowrap",
    isDarkMode && selectedCategory !== category.id ? "border-gray-700" : ""
  )}
>
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Bytes Grid */}
        <div className="space-y-6">
          {filteredBytes.map((bite) => {
             const timeAgo = getTimeAgo(bite.publishedAt);
            return (<div 
              key={bite.id} 
              className={cn(
    "rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
    isDarkMode 
      ? "bg-gray-800 border-gray-700 hover:shadow-gray-700/30" 
      : "bg-white border-gray-200 hover:shadow-md"
  )}
    data-insight-id={bite.id}
              onClick={() => handleClick(bite.id)}
            >
              <div className="sm:flex">
                {/* Image Section - Full width on mobile, fixed width on desktop */}
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
                  <div className={cn(
  "absolute bottom-2 left-2 flex items-center px-2 py-1 rounded-md text-xs font-medium",
  isDarkMode 
    ? "bg-gray-700/90 backdrop-blur-sm text-white" 
    : "bg-black/70 backdrop-blur-sm text-white"
)}>
  {bite.industry}
</div>

{bite.source && (
  <div className={cn(
    "absolute bottom-2 right-2 p-2 rounded-full cursor-pointer transition-colors text-white",
    isDarkMode 
      ? "bg-gray-700/90 hover:bg-gray-600/90" 
      : "bg-black/70 hover:bg-black/80"
  )}>
    <PlatformIcon source={bite.source} />
  </div>
)}
                </div>
                
                {/* Content Section */}
                <div className="p-4 sm:w-2/3">
                  <div className="flex items-center mb-3">
                    <img
                      src={bite.influencer.profileImage}
                      alt={bite.influencer.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                   <span className={cn(
  "text-sm font-medium",
  isDarkMode ? "text-gray-300" : "text-gray-700"
)}>

                      {bite.influencer.name}
                    </span>
                      <span className="mr-2"></span>
              
                  </div>
                  
                 <h3 className={cn(
  "font-bold text-lg mb-2 line-clamp-2",
  isDarkMode ? "text-white" : "text-gray-900"
)}>

                    {bite.title}
                  </h3>
                  
                <p className={cn(
  "text-sm line-clamp-3 mb-4",
  isDarkMode ? "text-gray-300" : "text-gray-600"
)}>
                    {bite.summary}
                  </p>
                  
                  
                  <div className="flex items-center justify-between">
                    {/* Sentiment Indicator */}
                    <div className="flex items-center">
                  
                    </div>
                    
                    <div className="flex items-center gap-3">
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
            </div>
              )})};
        </div>

        {filteredBytes.length === 0 && (
        <div className="text-center py-8">
  <p className={cn(
    isDarkMode ? "text-gray-400" : "text-gray-500"
  )}>
    No Bytes found matching your criteria.
  </p>
  <Button 
    variant="ghost"
    onClick={() => {
      setSelectedCategory("all");
      setSearchQuery("");
    }}
    className={cn(
      "mt-2",
      isDarkMode ? "text-gray-300 hover:bg-gray-700" : ""
    )}
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
