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

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('https://influenedoze.weddingmoments.fun/feed');
        const data: ApiInsight[] = await response.json();
        
        const formattedInsights: Insight[] = data.map((item) => {
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

        setInsights(formattedInsights);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching insights:", error);
        toast({
          title: "Error",
          description: "Failed to fetch insights. Please try again later.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Check if tutorial should be shown
  useEffect(() => {
    if (onboarded && !localStorage.getItem("tutorialShown")) {
      setShowTutorial(true);
    }
  }, [onboarded]);

  useEffect(() => {
    setCurrentInsightIndex(0);
    const positions = filteredInsights.map((_, i) => 
      i === 0 ? "" : "slide-down"
    );
    setInsightPositions(positions);
  }, [filteredInsights]);

  useEffect(() => {
    const newPositions = filteredInsights.map((_, i) => 
      i === currentInsightIndex ? "" : 
      (i < currentInsightIndex ? "slide-up" : "slide-down")
    );
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
    toast({
      title: "Sharing options",
      description: "Sharing functionality would open here",
    });
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
          navigateToNextInsight();
        } else {
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

  return (
    <div className="h-screen bg-background">
      {showTutorial && <SwipeTutorial onComplete={handleTutorialComplete} />}
      
      {!showingInfluencer ? (
        <div 
          className="swipe-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setShowNavbar(!showNavbar)}
          ref={swipeContainerRef}
        >
          {filteredInsights.map((insight, index) => (
            <InsightCard 
              key={insight.id}
              insight={insight}
              onSave={handleSaveInsight}
              onLike={handleLikeInsight}
              onShare={handleShareInsight}
              onFollowInfluencer={handleFollowInfluencer}
              onInfluencerClick={handleInfluencerClick}
              onSourceClick={handleSourceClick}
              position={insightPositions[index] || ""}
              userIndustries={selectedIndustries}
            />
          ))}
        </div>
      ) : (
        selectedInfluencer && (
          <div onTouchStart={handleTouchStart} 
               onTouchMove={handleTouchMove} 
               onTouchEnd={() => {
                 const swipeDirection = touchStartX - touchMoveX > 100 ? 'left' : 
                                      touchMoveX - touchStartX > 100 ? 'right' : null;
                 if (swipeDirection) {
                   handleInfluencerProfileSwipe(swipeDirection);
                 }
               }}>
            <InfluencerProfile 
              influencer={selectedInfluencer}
              onFollowToggle={handleFollowInfluencer}
              onInsightClick={handleInsightClick}
              onBack={() => {
                setShowingInfluencer(false);
                // Restore the previous insight index
                setCurrentInsightIndex(previousInsightIndex);
              }}
            />
          </div>
        )
      )}
      
      <Navigation />
    </div>
  );
};

export default Index;
