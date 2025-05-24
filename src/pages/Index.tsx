"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import InsightCard, { Insight } from "@/components/InsightCard";
import InfluencerProfile, { Influencer } from "@/components/InfluencerProfile";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CURRENT_INSIGHT_VERSION } from "@/constants/constants";
import SwipeTutorial from "@/components/SwipeTutorial";
import LoadingSpinner from "@/components/LoadingSpinner";
import SwipeContainer from "@/components/SwipeContainer";

// Sample data to use when API fails
const FALLBACK_INSIGHTS: Insight[] = [
  {
    id: "fallback-1",
    title: "The Future of AI Technology in Business",
    summary: "Artificial intelligence is transforming how businesses operate. From customer service chatbots to predictive analytics, AI is helping companies streamline operations and make better decisions. This insight explores the most promising applications and how companies can implement them effectively.",
    image: "https://images.unsplash.com/photo-1677442135136-60dd2f279279?q=80&w=2070",
    industry: "technology",
    influencer: {
      id: "inf-1",
      name: "Tech Insights",
      profileImage: "https://ui-avatars.com/api/?name=Tech+Insights",
      isFollowed: false
    },
    isSaved: false,
    isLiked: false,
    keyPoints: ["AI adoption increasing across industries", "Machine learning models becoming more accessible", "Focus on ethical AI implementation"],
    sentiment: "positive",
    publishedAt: new Date().toISOString(),
    source: "youtube",
    sourceUrl: "https://youtube.com/watch?v=example1"
  },
  {
    id: "fallback-2",
    title: "Sustainable Finance: Investment Trends for 2025",
    summary: "ESG (Environmental, Social, and Governance) investing continues to gain momentum. Investors are increasingly looking for companies that demonstrate commitment to sustainability while delivering solid returns. This insight covers the latest trends and opportunities in this growing sector.",
    image: "https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2002",
    industry: "finance",
    influencer: {
      id: "inf-2",
      name: "Finance Forward",
      profileImage: "https://ui-avatars.com/api/?name=Finance+Forward",
      isFollowed: false
    },
    isSaved: false,
    isLiked: false,
    keyPoints: ["Green bonds gaining popularity", "Carbon footprint reduction becoming key metric", "Regulatory changes supporting sustainable investments"],
    sentiment: "neutral",
    publishedAt: new Date().toISOString(),
    source: "linkedin",
    sourceUrl: "https://linkedin.com/posts/example"
  },
  {
    id: "fallback-3",
    title: "Healthcare Innovation: Telemedicine Revolution",
    summary: "The pandemic accelerated the adoption of telemedicine, and it's here to stay. Virtual care is expanding beyond simple consultations to include remote monitoring, specialized care, and integrated health platforms. This insight examines how healthcare providers are adapting to this new paradigm.",
    image: "https://images.unsplash.com/photo-1631217873436-b0fa38a5f311?q=80&w=2091",
    industry: "healthcare",
    influencer: {
      id: "inf-3",
      name: "Health Tech Today",
      profileImage: "https://ui-avatars.com/api/?name=Health+Tech",
      isFollowed: false
    },
    isSaved: false,
    isLiked: false,
    keyPoints: ["Patient satisfaction rates high for virtual visits", "Insurance companies expanding telemedicine coverage", "AI diagnostics enhancing remote care capabilities"],
    sentiment: "positive",
    publishedAt: new Date().toISOString(),
    source: "twitter",
    sourceUrl: "https://twitter.com/example/status/123"
  }
];

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

export interface SavedInsightsData {
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
  const [insights, setInsights] = useState<Insight[]>([]);
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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  const filteredInsights = useMemo(() => {
    if (selectedIndustries.length === 0) return insights;
    
    return insights.filter(insight => {
      const insightIndustry = insight.industry.toLowerCase();
      return selectedIndustries.some(industry => 
        insightIndustry.includes(industry.toLowerCase())
      );
    });
  }, [insights, selectedIndustries]);
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchInsights = async () => {
      console.log("Starting to fetch insights from:", API_BASE_URL);
      setIsLoading(true);
      setFetchError(null);
      
      try {
        console.log("Making fetch request to:", `${API_BASE_URL}/feed`);
        
        // Set a reasonable timeout for the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${API_BASE_URL}/feed`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          signal: controller.signal
        }).catch(err => {
          console.error("Fetch error:", err);
          throw err;
        });
        
        // Clear the timeout if the request completes
        clearTimeout(timeoutId);
        
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data: ApiInsight[] = await response.json();
        console.log("Fetched data:", data);
        console.log("Number of insights fetched:", data?.length || 0);
        
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: expected array");
        }
        
        const formattedInsights: Insight[] = data.map((item, index) => {
          console.log(`Processing insight ${index}:`, item);
          
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

        console.log("Formatted insights:", formattedInsights);
        if (formattedInsights.length > 0) {
          setInsights(formattedInsights);
          setUsingFallbackData(false);
        } else {
          // No insights returned, fall back to sample data
          console.log("No insights returned from API, using fallback data");
          setInsights(FALLBACK_INSIGHTS);
          setUsingFallbackData(true);
          toast({
            title: "Using sample data",
            description: "We couldn't load your content from the server. Showing sample data instead.",
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching insights:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setFetchError(errorMessage);
        
        console.log("Falling back to sample data due to error");
        setInsights(FALLBACK_INSIGHTS);
        setUsingFallbackData(true);
        
        toast({
          title: "Connection issue",
          description: "Using sample data while we try to reconnect to the server.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [API_BASE_URL]);

  // Check if tutorial should be shown
  useEffect(() => {
    if (onboarded && !localStorage.getItem("tutorialShown")) {
      setShowTutorial(true);
    }
  }, [onboarded]);

  // Initialize positions when filtered insights change
  useEffect(() => {
    console.log("Setting up initial positions for", filteredInsights.length, "insights");
    setCurrentInsightIndex(0);
    const positions = filteredInsights.map((_, i) => {
      const position = i === 0 ? "" : "slide-down";
      console.log(`Insight ${i} position:`, position);
      return position;
    });
    setInsightPositions(positions);
  }, [filteredInsights]);

  // Update positions when current insight changes
  useEffect(() => {
    console.log("Updating positions for current insight index:", currentInsightIndex);
    const newPositions = filteredInsights.map((_, i) => {
      let position = "";
      if (i === currentInsightIndex) {
        position = "";
      } else if (i < currentInsightIndex) {
        position = "slide-up";
      } else {
        position = "slide-down";
      }
      console.log(`Insight ${i} new position:`, position);
      return position;
    });
    setInsightPositions(newPositions);
  }, [currentInsightIndex, filteredInsights]);

  useEffect(() => {
    if (showingInfluencer && selectedInfluencer) {
      const influencerFromInsights = insights.find(i => i.influencer.id === selectedInfluencer.id);
      if (influencerFromInsights) {
        setSelectedInfluencer({
          ...selectedInfluencer,
          isFollowed: influencerFromInsights.influencer.isFollowed
        });
      }
    }
  }, [showingInfluencer, insights, selectedInfluencer]);

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
    setInsights(prevInsights => {
      const updatedInsights = prevInsights.map(insight => {
        if (insight.id === id) {
          return { ...insight, isSaved: !insight.isSaved };
        }
        return insight;
      });

      // Get current saved insights data from localStorage
      const savedData: SavedInsightsData = JSON.parse(
        localStorage.getItem("savedInsights") || '{"versions":{}}'
      );

      // Find the insight being toggled
      const insightToToggle = updatedInsights.find(i => i.id === id);
      
      if (insightToToggle) {
        // Initialize version if it doesn't exist
        if (!savedData.versions[CURRENT_INSIGHT_VERSION]) {
          savedData.versions[CURRENT_INSIGHT_VERSION] = [];
        }
        
        if (insightToToggle.isSaved) {
          // Add to current version's saved insights
          const versionInsights = savedData.versions[CURRENT_INSIGHT_VERSION] || [];
          savedData.versions[CURRENT_INSIGHT_VERSION] = [
            ...versionInsights.filter(i => i.id !== id), // Remove if already exists
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

        // Update saved insights in localStorage
        localStorage.setItem("savedInsights", JSON.stringify(savedData));
        localStorage.setItem("insights", JSON.stringify(updatedInsights));
      }

      return updatedInsights;
    });

    const isSaved = insights.find(i => i.id === id)?.isSaved;
    toast({
      title: isSaved ? "Saved" : "Removed from saved",
      description: isSaved 
        ? `Added to version ${CURRENT_INSIGHT_VERSION} collection` 
        : "Removed from your saved items",
    });
  };

  const handleLikeInsight = (id: string) => {
    setInsights(insights.map(insight => {
      if (insight.id === id) {
        return { ...insight, isLiked: !insight.isLiked };
      }
      return insight;
    }));
  };
  
  const handleShareInsight = (id: string) => {
    const insight = insights.find(i => i.id === id);
    if (!insight) return;
    
    const shareData = {
      title: insight.title,
      text: insight.summary.substring(0, 100) + '...', // First 100 chars of summary
      url: insight.sourceUrl || window.location.href,
    };

    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          toast({
            title: "Shared successfully",
            description: "Thanks for sharing this insight!",
          });
        })
        .catch((error) => {
          console.error('Error sharing:', error);
          toast({
            title: "Error",
            description: "Couldn't share the insight",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for desktop browsers
      toast({
        title: "Share this insight",
        description: (
          <div className="flex flex-col space-y-2">
            <p>{insight.title}</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(insight.title)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
                }}
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`, '_blank');
                }}
              >
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${insight.title} - ${shareData.url}`);
                  toast({
                    title: "Copied to clipboard",
                    description: "You can now paste the link anywhere",
                  });
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        ),
      });
    }
  };

  const handleFollowInfluencer = (influencerId: string) => {
    setInsights(insights.map(insight => {
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
    const insight = insights.find(i => i.influencer.id === influencerId);
    if (!insight) return;
    
    // Store the current index before navigating away
    setPreviousInsightIndex(currentInsightIndex);
    
    const influencerInsights = insights
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
      recentInsights: influencerInsights.slice(0, 3)
    });
    
    setShowingInfluencer(true);
  };
  
  const handleInsightClick = () => {
    setShowingInfluencer(false);
    // Restore the previous insight index
    setCurrentInsightIndex(previousInsightIndex);
  };

  const handleSourceClick = (url: string) => {
    // Store the current index before navigating away
    setPreviousInsightIndex(currentInsightIndex);
    window.open(url, '_blank');
  };
  
  const navigateToNextInsight = () => {
    console.log("Navigating to next insight. Current:", currentInsightIndex, "Total:", filteredInsights.length);
    if (currentInsightIndex < filteredInsights.length - 1 && !isAnimating) {
      setIsAnimating(true);
      
      const newPositions = [...insightPositions];
      newPositions[currentInsightIndex] = "slide-up";
      setInsightPositions(newPositions);
      
      setTimeout(() => {
        setCurrentInsightIndex(currentInsightIndex + 1);
        setIsAnimating(false);
      }, 300);
    } else if (currentInsightIndex === filteredInsights.length - 1) {
      toast({
        title: "No more insights",
        description: "You've reached the end of your feed",
      });
    }
  };
  
  const navigateToPreviousInsight = () => {
    console.log("Navigating to previous insight. Current:", currentInsightIndex);
    if (currentInsightIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      
      const newPositions = [...insightPositions];
      newPositions[currentInsightIndex] = "slide-down";
      setInsightPositions(newPositions);
      
      setTimeout(() => {
        setCurrentInsightIndex(currentInsightIndex - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const navigateToInfluencerProfile = () => {
    if (!isAnimating && filteredInsights.length > 0) {
      setIsAnimating(true);
      handleInfluencerClick(filteredInsights[currentInsightIndex].influencer.id);
      setIsAnimating(false);
    }
  };

  const navigateToSourceUrl = () => {
    if (!isAnimating && filteredInsights.length > 0) {
      setIsAnimating(true);
      const insight = filteredInsights[currentInsightIndex];
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
    return <LoadingSpinner message="Loading insights..." />;
  }

  // Show error state if fetch failed and no fallback data
  if (fetchError && !usingFallbackData && insights.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load content: {fetchError}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredInsights.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-primary mb-4">
            {insights.length === 0 
              ? "No insights available at the moment." 
              : "No insights match your selected industries."}
          </p>
          {insights.length > 0 && (
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

  console.log("Rendering insights. Current index:", currentInsightIndex, "Total insights:", filteredInsights.length);

  return (
    <div className="h-screen bg-background overflow-hidden">
      {showTutorial && <SwipeTutorial onComplete={handleTutorialComplete} />}
      
      {usingFallbackData && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white text-xs text-center py-1">
          Using sample data - Connection issue
        </div>
      )}
      
      {!showingInfluencer ? (
        <SwipeContainer
          insights={filteredInsights}
          positions={insightPositions}
          onSave={handleSaveInsight}
          onLike={handleLikeInsight}
          onShare={handleShareInsight}
          onFollowInfluencer={handleFollowInfluencer}
          onInfluencerClick={handleInfluencerClick}
          onSourceClick={handleSourceClick}
          userIndustries={selectedIndustries}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setShowNavbar(!showNavbar)}
          ref={swipeContainerRef}
        />
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
