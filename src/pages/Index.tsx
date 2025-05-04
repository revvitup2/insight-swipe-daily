import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import InsightCard, { Insight } from "@/components/InsightCard";
import InfluencerProfile, { Influencer } from "@/components/InfluencerProfile";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";

interface ApiInsight {
  influencer_id: string;
  video_id: string;
  published_at: string;
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

const Index = () => {
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("onboarded") === "true";
  });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
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
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('https://influenedoze.weddingmoments.fun/feed');
        const data: ApiInsight[] = await response.json();
        
        const formattedInsights: Insight[] = data.map((item) => {
          // Correctly identify YouTube URLs
          // Check if sourceUrl contains youtube or youtu.be domains
          const sourceUrl = item.source?.url || `https://youtube.com/watch?v=${item.video_id}`;
          
          // Set all sources as YouTube since all are YouTube links
          const sourcePlatform = "youtube";
          
          return {
            id: item.video_id,
            title: item.metadata.title,
            summary: item.analysis.summary,
            image: item.metadata.thumbnails.high.url,
            industry: item.analysis.topics[0] || "General",
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

  useEffect(() => {
    // Initialize positions
    const positions = insights.map((_, i) => 
      i === currentInsightIndex ? "" : (i < currentInsightIndex ? "slide-up" : "slide-down")
    );
    setInsightPositions(positions);
  }, [insights, currentInsightIndex]);

  const handleOnboardingComplete = (selectedIndustries: string[]) => {
    localStorage.setItem("onboarded", "true");
    setOnboarded(true);
    
    toast({
      title: "Welcome to VibeOn!",
      description: "We've personalized your feed based on your interests.",
    });
  };
  
  const handleSaveInsight = (id: string) => {
    setInsights(insights.map(insight => {
      if (insight.id === id) {
        return { ...insight, isSaved: !insight.isSaved };
      }
      return insight;
    }));
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
      followerCount: Math.floor(Math.random() * 1000000), // Random follower count for demo
      engagementScore: parseFloat((Math.random() * 5 + 5).toFixed(1)), // Random score 5.0-9.9
      isFollowed: insight.influencer.isFollowed,
      recentInsights: influencerInsights.slice(0, 3) // Show up to 3 recent insights
    });
    
    setShowingInfluencer(true);
  };
  
  const handleInsightClick = () => {
    setShowingInfluencer(false);
  };

  const handleSourceClick = (url: string) => {
    // Open the source URL in a new tab
    window.open(url, '_blank');
  };
  
  const navigateToNextInsight = () => {
    if (currentInsightIndex < insights.length - 1 && !isAnimating) {
      setIsAnimating(true);
      
      const newPositions = [...insightPositions];
      newPositions[currentInsightIndex] = "slide-up";
      setInsightPositions(newPositions);
      
      setTimeout(() => {
        setCurrentInsightIndex(currentInsightIndex + 1);
        setIsAnimating(false);
      }, 300);
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
    if (!isAnimating && insights.length > 0) {
      setIsAnimating(true);
      handleInfluencerClick(insights[currentInsightIndex].influencer.id);
      setIsAnimating(false);
    }
  };

  const navigateToSourceUrl = () => {
    if (!isAnimating && insights.length > 0) {
      setIsAnimating(true);
      const insight = insights[currentInsightIndex];
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
    
    // Determine the primary direction of the swipe
    const verticalDistance = Math.abs(touchMoveY - touchStartY);
    const horizontalDistance = Math.abs(touchMoveX - touchStartX);
    
    // If it's more horizontal than vertical and exceeds threshold
    if (horizontalDistance > verticalDistance && horizontalDistance > 30) {
      setIsHorizontalSwipe(true);
    }
  };
  
  const handleTouchEnd = () => {
    const verticalSwipeDistance = touchStartY - touchMoveY;
    const horizontalSwipeDistance = touchStartX - touchMoveX;
    
    if (isHorizontalSwipe) {
      // Process horizontal swipe
      if (Math.abs(horizontalSwipeDistance) > 100) {
        if (horizontalSwipeDistance > 0) {
          // Swiped left - go to influencer profile
          navigateToInfluencerProfile();
        } else {
          // Swiped right - go to source URL
          navigateToSourceUrl();
        }
      }
    } else {
      // Process vertical swipe
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
  
  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary">No insights available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      {!showingInfluencer ? (
        <div 
          className="swipe-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setShowNavbar(!showNavbar)}
          ref={swipeContainerRef}
        >
          {insights.map((insight, index) => (
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
            />
          ))}
        </div>
      ) : (
        selectedInfluencer && (
          <InfluencerProfile 
            influencer={selectedInfluencer}
            onFollowToggle={handleFollowInfluencer}
            onInsightClick={handleInsightClick}
            onBack={() => setShowingInfluencer(false)}
          />
        )
      )}
      
      <Navigation />
    </div>
  );
};

export default Index;
