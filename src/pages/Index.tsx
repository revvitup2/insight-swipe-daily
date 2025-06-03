"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import InsightCard, { Insight, PlatformIcon } from "@/components/InsightCard";
import InfluencerProfile, { Influencer } from "@/components/InfluencerProfile";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CURRENT_INSIGHT_VERSION } from "@/constants/constants";
import SwipeTutorial from "@/components/SwipeTutorial";
import LoadingSpinner from "@/components/LoadingSpinner";
import { motion, AnimatePresence } from 'framer-motion';
import ByteMeLogo from "@/components/ByteMeLogo";
import { cn } from "@/lib/utils";
import { Save, Share } from "lucide-react";

interface ApiInsight {
  influencer_id: string;
  video_id: string;
  published_at: string;
  industry:string;
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

// Add this to your types file or at the top of your component
export interface VersionedInsight extends Insight {
  version: number;
  savedAt: string;
}

export interface SavedBytesData {
  versions: {
    [version: number]: Insight[];
  };
}

const Index = () => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(() => {
    const stored = localStorage.getItem("selectedIndustries");
    return stored ? JSON.parse(stored) : [];
  });

  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("onboarded") === "true";
  });
  const [direction, setDirection] = useState(1);
  const [isSharing, setIsSharing] = useState(false);
  const [Bytes, setBytes] = useState<Insight[]>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [previousInsightIndex, setPreviousInsightIndex] = useState(0);
  const [showingInfluencer, setShowingInfluencer] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchMoveX, setTouchMoveX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchMoveY, setTouchMoveY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [insightPositions, setInsightPositions] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);
    const [sharingState, setSharingState] = useState<Record<string, boolean>>({});
  
  const navigate = useNavigate();

  const filteredBytes = useMemo(() => {
    if (selectedIndustries.length === 0) return Bytes;
    
    return Bytes.filter(insight => {
      const insightIndustry = insight.industry.toLowerCase();
      return selectedIndustries.some(industry => 
        insightIndustry.includes(industry.toLowerCase())
      );
    });
  }, [Bytes, selectedIndustries]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchBytes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed`);
        const data: ApiInsight[] = await response.json();
        
        const formattedBytes: Insight[] = data.map((item) => {
          // Determine the source platform based on the URL
          const sourceUrl = item.source?.url || `https://youtube.com/watch?v=${item.video_id}`;
          
          // Default to YouTube as the platform since you mentioned all are YouTube links
          // But still check URL pattern to be safe
          let sourcePlatform: "youtube" | "twitter" | "linkedin" | "other" = "youtube";
          
          // To be extra safe, check URL pattern
          if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) {
            sourcePlatform = "youtube";
          } else if (sourceUrl.includes('twitter.com') || sourceUrl.includes('x.com')) {
            sourcePlatform = "twitter";
          } else if (sourceUrl.includes('linkedin.com')) {
            sourcePlatform = "linkedin";
          } else {
            sourcePlatform = "other";
          }
          
          return {
            id: item.video_id,
            title: item.metadata.title,
            summary: item.analysis.summary,
            image: item.metadata.thumbnails.high.url,
            industry: item.industry || "General",
            influencer: {
              id: item.influencer_id,
              name: item.metadata.channel_title,
              channel_id: item.influencer_id, // Add the missing channel_id property
              profileImage: "https://ui-avatars.com/api/?name=" + encodeURIComponent(item.metadata.channel_title),
              isFollowed: false
            },
            isSaved: false,
            isLiked: false,
            keyPoints: item.analysis.key_points,
            sentiment: item.analysis.sentiment,
            publishedAt: item.published_at,
            source: sourcePlatform,
            sourceUrl: sourceUrl
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

  // Check if tutorial should be shown
  useEffect(() => {
    if (onboarded && !localStorage.getItem("tutorialShown")) {
      setShowTutorial(true);
    }
  }, [onboarded]);

  useEffect(() => {
    setCurrentInsightIndex(0);
    const positions = filteredBytes.map((_, i) => 
      i === 0 ? "" : "slide-down"
    );
    setInsightPositions(positions);
  }, [filteredBytes]);

  useEffect(() => {
    const newPositions = filteredBytes.map((_, i) => 
      i === currentInsightIndex ? "" : 
      (i < currentInsightIndex ? "slide-up" : "slide-down")
    );
    setInsightPositions(newPositions);
  }, [currentInsightIndex, filteredBytes]);

  useEffect(() => {
    if (showingInfluencer && selectedInfluencer) {
      const influencerFromBytes = Bytes.find(i => i.influencer.id === selectedInfluencer.id);
      if (influencerFromBytes) {
        setSelectedInfluencer({
          ...selectedInfluencer,
          isFollowed: influencerFromBytes.influencer.isFollowed
        });
      }
    }
  }, [showingInfluencer, Bytes, selectedInfluencer]);

  const handleOnboardingComplete = (selectedIndustries: string[]) => {
    localStorage.setItem("selectedIndustries", JSON.stringify(selectedIndustries));
    localStorage.setItem("onboarded", "true");
    setSelectedIndustries(selectedIndustries);
    setOnboarded(true);
    
    toast({
      title: "Welcome to ByteMe!",
      description: "We've personalized your feed based on your interests.",
    });
    
    // Show tutorial after onboarding
    setShowTutorial(true);
  };
  
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem("tutorialShown", "true");
  };

  const handleSaveInsight = (id: string) => {
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
              ...insightToToggle
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
        localStorage.setItem("Bytes", JSON.stringify(updatedBytes));
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

  const handleLikeInsight = (id: string) => {
    setBytes(Bytes.map(insight => {
      if (insight.id === id) {
        return { ...insight, isLiked: !insight.isLiked };
      }
      return insight;
    }));
  };


const handleShareInsight = async (id: string) => {
  const insight = Bytes.find(i => i.id === id);
  if (!insight) return;

  try {
    setIsSharing(true); // Start loading

    const insightCard = document.querySelector(`.insight-card`) as HTMLElement;
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

    const shareUrl = `${window.location.origin}/Bytes/${insight.id}`;
    const shareText = `${insight.title}\n\n${insight.summary.substring(0, 100)}...\n\nTo read more insightful Bytes in less than 60 words, visit: ${shareUrl}`;
    const file = new File([blob], 'insight.png', { type: 'image/png' });

    // Check support for full share with image
    const canShareWithImage = navigator.canShare && navigator.canShare({ files: [file] });

    if (navigator.share) {
      if (canShareWithImage) {
        await navigator.share({
          title: insight.title,
          text: shareText,
          url: shareUrl,
          files: [file],
        });
      } else {
        // Fallback to just text and link if image share isn't supported
        await navigator.share({
          title: insight.title,
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
                alt={insight.title} 
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

  const handleShareDesktop = async (id: string) => {
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

  const handleFollowInfluencer = (influencerId: string) => {
    setBytes(Bytes.map(insight => {
      if (insight.influencer.id === influencerId) {
        return { 
          ...insight, 
          influencer: {
            ...insight.influencer,
            isFollowed: !insight.influencer.isFollowed
          } 
        };
      }
      return insight;
    }));
    
    if (selectedInfluencer && selectedInfluencer.id === influencerId) {
      setSelectedInfluencer({
        ...selectedInfluencer,
        isFollowed: !selectedInfluencer.isFollowed
      });
    }
  };
  
  const handleInfluencerClick = (influencerId: string) => {
    const insight = Bytes.find(i => i.influencer.id === influencerId);
    if (!insight) return;
    
    // Store the current index before navigating away
    setPreviousInsightIndex(currentInsightIndex);
    
    const influencerBytes = Bytes
      .filter(i => i.influencer.id === influencerId)
      .map(i => ({
        id: i.id,
        title: i.title,
        summary: i.summary,
        image: i.image
      }));
    
    setSelectedInfluencer({
      id: influencerId,
      name: insight.influencer.name,
      profileImage: insight.influencer.profileImage,
      bio: `Content creator on ${insight.influencer.name}`,
      industry: insight.industry,
      followerCount: Math.floor(Math.random() * 1000000),
      engagementScore: parseFloat((Math.random() * 5 + 5).toFixed(1)),
      isFollowed: insight.influencer.isFollowed,
      recentBytes: influencerBytes.slice(0, 3)
    });
    
    setShowingInfluencer(true);
  };
  
  const handleInsightClick = (id:string) => {
    setShowingInfluencer(false);
    // Restore the previous insight index
    // setCurrentInsightIndex(previousInsightIndex);
      navigate(`/bytes/${id}`);
  };

  const handleSourceClick = (url: string) => {
    // Store the current index before navigating away
    setPreviousInsightIndex(currentInsightIndex);
    window.open(url, '_blank');
  };
  
const navigateToNextInsight = () => {
  if (currentInsightIndex < filteredBytes.length - 1 && !isAnimating) {
    setIsAnimating(true);
    setDirection(1); // Forward direction
    
    setTimeout(() => {
      setCurrentInsightIndex(currentInsightIndex + 1);
      setIsAnimating(false);
    }, 300);
  } else if (currentInsightIndex === filteredBytes.length - 1) {
    toast({
      title: "No more Bytes",
      description: "You've reached the end of your feed",
    });
  }
};

const navigateToPreviousInsight = () => {
  if (currentInsightIndex > 0 && !isAnimating) {
    setIsAnimating(true);
    setDirection(-1); // Backward direction
    
    setTimeout(() => {
      setCurrentInsightIndex(currentInsightIndex - 1);
      setIsAnimating(false);
    }, 300);
  }
};

  const navigateToInfluencerProfile = () => {
    if (!isAnimating && filteredBytes.length > 0) {
      setIsAnimating(true);
      handleInfluencerClick(filteredBytes[currentInsightIndex].influencer.id);
      setIsAnimating(false);
    }
  };

  const navigateToSourceUrl = () => {
    if (!isAnimating && filteredBytes.length > 0) {
      setIsAnimating(true);
      const insight = filteredBytes[currentInsightIndex];
      if (insight.sourceUrl) {
        handleSourceClick(insight.sourceUrl);
      }
      setIsAnimating(false);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.targetTouches[0].clientY);
    setTouchMoveY(e.targetTouches[0].clientY);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchMoveX(e.targetTouches[0].clientX);
    setIsHorizontalSwipe(false);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchMoveY(e.targetTouches[0].clientY);
    setTouchMoveX(e.targetTouches[0].clientX);
    
    const verticalDistance = Math.abs(touchMoveY - touchStartY);
    const horizontalDistance = Math.abs(touchMoveX - touchStartX);
    
    if (horizontalDistance > verticalDistance && horizontalDistance > 30) {
      setIsHorizontalSwipe(true);
    }
  };

  const handleTouchEnd = () => {
  const verticalSwipeDistance = touchStartY - touchMoveY;
  const horizontalSwipeDistance = touchStartX - touchMoveX;
  
  if (isHorizontalSwipe) {
    if (Math.abs(horizontalSwipeDistance) > 100) {
      if (horizontalSwipeDistance > 0) {
        navigateToInfluencerProfile();
      } else {
        navigateToSourceUrl();
      }
    }
  } else {
    if (Math.abs(verticalSwipeDistance) > 100) {
      if (verticalSwipeDistance > 0) {
        setDirection(1); // Forward
        navigateToNextInsight();
      } else {
        setDirection(-1); // Backward
        navigateToPreviousInsight();
      }
    } else {
      setShowNavbar(!showNavbar);
    }
  }
};
  // Return to feed from influencer profile with horizontal swipe
  const handleInfluencerProfileSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setShowingInfluencer(false);
      // Restore the previous insight index
      setCurrentInsightIndex(previousInsightIndex);
    }
  };

  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading Bytes..." />;
  }

  if (filteredBytes.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-primary mb-4">
            {Bytes.length === 0 
              ? "No Bytes available at the moment." 
              : "No Bytes match your selected industries."}
          </p>
          {Bytes.length > 0 && (
            <Button 
              onClick={() => navigate("/profile")}
              className="bg-primary hover:bg-primary/90"
            >
              Update Interests
            </Button>
          )}
        </div>
      </div>
    );
  }
    if (window.innerWidth > 768) {
      return(
         <div className="page-container bg-background">
        {/* Bytes Grid */}
              <div className="p-4 pb-20 max-w-7xl mx-auto mt-10">
        <div className="space-y-6">
          {filteredBytes.map((bite) => (
            <div 
              key={bite.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              data-insight-id={bite.id}
              onClick={() => handleInsightClick(bite.id)}
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
                  <div className="absolute bottom-2 left-2 flex items-center bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
                    {bite.industry}
                  </div>
                  
                  {/* Source Platform - Bottom right with subtle black background */}
                  {bite.source && (
                    <div 
                      className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-black/80 transition-colors text-white"
                    >
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
                    {/* Sentiment Indicator */}
                    <div className="flex items-center">
                  
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveInsight(bite.id);
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
                          handleShareDesktop(bite.id);
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
          ))}
        </div>
</div>
 
      <Navigation />
  
      </div>
      );
    }
  

  return (
    <div className="h-screen bg-background relative">
       {isSharing && (
      <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Preparing share content...</p>
        </div>
      </div>
    )}
      {showTutorial && <SwipeTutorial onComplete={handleTutorialComplete} />}
          {!showingInfluencer ? (
      <div 
        className="swipe-container h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setShowNavbar(!showNavbar)}
        ref={swipeContainerRef}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentInsightIndex}
            custom={direction}
            initial={{ y: direction === 1 ? 100 : -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction === 1 ? -100 : 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full">
               <InsightCard 
              key={filteredBytes[currentInsightIndex].id}
              insight={filteredBytes[currentInsightIndex]}
              onSave={handleSaveInsight}
              onLike={handleLikeInsight}
              onShare={handleShareInsight}
              onFollowInfluencer={handleFollowInfluencer}
              onInfluencerClick={handleInfluencerClick}
              onSourceClick={handleSourceClick}
              userIndustries={selectedIndustries} 
              position={""}
                onClick={handleInsightClick}
            
            />
          </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        selectedInfluencer && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onTouchStart={handleTouchStart} 
            onTouchMove={handleTouchMove} 
            onTouchEnd={() => {
              const swipeDirection = touchStartX - touchMoveX > 100 ? 'left' : 
                                   touchMoveX - touchStartX > 100 ? 'right' : null;
              if (swipeDirection) {
                handleInfluencerProfileSwipe(swipeDirection);
              }
            }}
          >
            <InfluencerProfile 
              influencer={selectedInfluencer}
              onFollowToggle={handleFollowInfluencer}
              onInsightClick={handleInsightClick}
              onBack={() => {
                setShowingInfluencer(false);
                setCurrentInsightIndex(previousInsightIndex);
              }}
            />
          </motion.div>
        )
      )}
      
      <Navigation />
    </div>
  );
};

export default Index;
