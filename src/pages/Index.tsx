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
import { useTheme } from "@/contexts/ThemeContext";
import { formatDistanceToNow } from "date-fns";
import { getCurrentUserToken } from "@/lib/firebase";
import { removeSavedFeedItem, saveFeedItem } from "@/lib/api";
import { useSavedInsights } from "@/components/savedInsightUtils";
import { useSelectedIndustries } from "@/contexts/selectedIndustries";
import { useAuth } from "@/contexts/AuthContext";
import { useFeed } from "@/hooks/use-feed";
import { usePaginatedFeed } from "@/hooks/use-paginated-feed";

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
  const { user, token } = useAuth();
  const { selectedIndustries } = useSelectedIndustries(user, token);
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("onboarded") === "true";
  });
  const [direction, setDirection] = useState(1);
  const [isSharing, setIsSharing] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(() => {
    const saved = localStorage.getItem("homePageIndex");
    return saved ? parseInt(saved, 10) : 0;
  });
  const { handleSaveInsightInApi } = useSavedInsights();
  const [previousInsightIndex, setPreviousInsightIndex] = useState(0);
  const [showingInfluencer, setShowingInfluencer] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchMoveX, setTouchMoveX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchMoveY, setTouchMoveY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showTabNavigation, setShowTabNavigation] = useState(true);
  const [insightPositions, setInsightPositions] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const [sharingState, setSharingState] = useState<Record<string, boolean>>({});
  const [isSummaryScrolling, setIsSummaryScrolling] = useState(false);
  const [allowCardSwipe, setAllowCardSwipe] = useState(true);
  const [summaryEdgeState, setSummaryEdgeState] = useState<{atTop: boolean, atBottom: boolean}>({ atTop: true, atBottom: true });
  const summaryScrollSwipeDirectionRef = useRef<null | "up" | "down">(null);
  const [isSummaryEdgeAttempted, setIsSummaryEdgeAttempted] = useState(false);
  const [isSummaryEdgeAttemptedDirection, setIsSummaryEdgeAttemptedDirection] = useState<"up" | "down" | null>(null);
  const { isDarkMode } = useTheme();
  const { 
    feed: Bytes, 
    isLoading, 
    isLoadingMore, 
    error, 
    hasMore, 
    loadMore 
  } = usePaginatedFeed(user, token);
  const [isHandlingLoadMore, setIsHandlingLoadMore] = useState(false);
  
  // Track the previous length to detect new data
  const previousBytesLength = useRef(0);
  const isFirstLoad = useRef(true);

  const navigate = useNavigate();

  // Save current index to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("homePageIndex", currentInsightIndex.toString());
  }, [currentInsightIndex]);

  useEffect(() => {
    if (onboarded && !localStorage.getItem("tutorialShown")) {
      setShowTutorial(true);
    }
  }, [onboarded]);

  // Fixed useEffect - only reset index on first load, not on pagination
  useEffect(() => {
    // Only reset index if this is the first load or if we're not loading more
    if (isFirstLoad.current && !isLoadingMore && !isHandlingLoadMore) {
      setCurrentInsightIndex(0);
      isFirstLoad.current = false;
    }
    
    // Update positions for all items
    const positions = Bytes.map((_, i) => 
      i === currentInsightIndex ? "" : "slide-down"
    );
    setInsightPositions(positions);
    
    // Update the previous length tracker
    previousBytesLength.current = Bytes.length;
  }, [Bytes, currentInsightIndex]); // Removed isLoadingMore and isHandlingLoadMore from dependencies

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || isHandlingLoadMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (isNearBottom) {
        setIsHandlingLoadMore(true);
        loadMore().finally(() => setIsHandlingLoadMore(false));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading, isLoadingMore, loadMore, isHandlingLoadMore]);

  useEffect(() => {
    const newPositions = Bytes.map((_, i) => 
      i === currentInsightIndex ? "" : 
      (i < currentInsightIndex ? "slide-up" : "slide-down")
    );
    setInsightPositions(newPositions);
  }, [currentInsightIndex, Bytes]);

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
    setOnboarded(true);
    
    toast({
      title: "Welcome to ByteMe!",
      description: "We've personalized your feed based on your interests.",
    });
    
    setShowTutorial(true);
  };
  
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem("tutorialShown", "true");
  };

  const handleSaveInsight = async (id: string) => {
    const newSavedStatus = await handleSaveInsightInApi(id);
  };

  const handleShareInsight = async (id: string) => {
    const insight = Bytes.find(i => i.id === id);
    if (!insight) return;

    try {
      setIsSharing(true);

      const insightCard = document.querySelector(`.insight-card`) as HTMLElement;
      if (!insightCard) {
        setIsSharing(false);
        return;
      }

      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(insightCard, {
        quality: 0.95,
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        cacheBust: true,
      });

      if (!blob) {
        setIsSharing(false);
        return;
      }

      const shareUrl = `${window.location.origin}/Bytes/${insight.id}`;
      const shareText = `${insight.title}\n\n${insight.summary.substring(0, 100)}...\n\nTo read more insightful Bytes in less than 60 words, visit: ${shareUrl}`;
      const file = new File([blob], 'insight.png', { type: 'image/png' });

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
          await navigator.share({
            title: insight.title,
            text: shareText,
            url: shareUrl,
          });
        }
      } else {
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

  const handleShareDesktop = async (id: string) => {
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
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
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

  const handleInfluencerClick = (influencerId: string) => {
    const insight = Bytes.find(i => i.influencer.id === influencerId);
    if (!insight) return;
    
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
      profileImage: "",
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
    navigate(`/bytes/${id}`);
  };

  const handleSourceClick = (url: string) => {
    setPreviousInsightIndex(currentInsightIndex);
    window.open(url, '_blank');
  };
  
  const getTimeAgo = (publishedAt: string) => {
    return publishedAt 
      ? formatDistanceToNow(new Date(publishedAt), { addSuffix: false })
      : '';
  };
  
  const navigateToNextInsight = () => {
    if (currentInsightIndex < Bytes.length - 1 && !isAnimating) {
      // Normal case - just move to next item
      setIsAnimating(true);
      setDirection(1);
      setCurrentInsightIndex(currentInsightIndex + 1);
      setTimeout(() => setIsAnimating(false), 50);
      
      // Load more if we're near the end
      if (currentInsightIndex >= Bytes.length - 3 && hasMore && !isLoadingMore) {
        setIsHandlingLoadMore(true);
        loadMore().finally(() => setIsHandlingLoadMore(false));
      }
    } else if (currentInsightIndex === Bytes.length - 1 && hasMore && !isLoadingMore) {
      // Special case - we're at the end and need to load more
      setIsHandlingLoadMore(true);
      const currentIndexBeforeLoad = currentInsightIndex; // Save current index
      
      loadMore().then(() => {
        // After loading, maintain the position by setting to the next index
        setCurrentInsightIndex(currentIndexBeforeLoad + 1);
        setIsAnimating(true);
        setDirection(1);
        setTimeout(() => {
          setIsAnimating(false);
          setIsHandlingLoadMore(false);
        }, 50);
      }).catch(() => {
        setIsHandlingLoadMore(false);
      });
    } else if (currentInsightIndex === Bytes.length - 1) {
      toast({
        title: "No more Bytes",
        description: "You've reached the end of your feed",
      });
    }
  };

  const navigateToPreviousInsight = () => {
    if (currentInsightIndex > 0 && !isAnimating) {
      setIsAnimating(true);
      setDirection(-1);
      setCurrentInsightIndex(currentInsightIndex - 1);
      setTimeout(() => setIsAnimating(false), 50);
    }
  };

  const navigateToInfluencerProfile = () => {
    if (!isAnimating && Bytes.length > 0) {
      setIsAnimating(true);
      handleInfluencerClick(Bytes[currentInsightIndex].influencer.id);
      setIsAnimating(false);
    }
  };

  const navigateToSourceUrl = () => {
    if (!isAnimating && Bytes.length > 0) {
      setIsAnimating(true);
      const insight = Bytes[currentInsightIndex];
      if (insight.sourceUrl) {
        handleSourceClick(insight.sourceUrl);
      }
      setIsAnimating(false);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSummaryScrolling) return; // Prevent handling if in summary scroll
    setTouchStartY(e.targetTouches[0].clientY);
    setTouchMoveY(e.targetTouches[0].clientY);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchMoveX(e.targetTouches[0].clientX);
    setIsHorizontalSwipe(false);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSummaryScrolling) return; // Prevent swipe if summary is being scrolled
    setTouchMoveY(e.targetTouches[0].clientY);
    setTouchMoveX(e.targetTouches[0].clientX);
    
    const verticalDistance = Math.abs(touchMoveY - touchStartY);
    const horizontalDistance = Math.abs(touchMoveX - touchStartX);
    
    if (horizontalDistance > verticalDistance && horizontalDistance > 15) {
      setIsHorizontalSwipe(true);
    }
  };

  const handleTouchEnd = () => {
    // Only process card swipes if not currently scrolling summary or if explicitly allowed
    if (isSummaryScrolling && !allowCardSwipe) {
      return;
    }

    const verticalSwipeDistance = touchStartY - touchMoveY;
    const horizontalSwipeDistance = touchStartX - touchMoveX;

    if (isHorizontalSwipe) {
      if (Math.abs(horizontalSwipeDistance) > 40) {
        if (horizontalSwipeDistance > 0) {
          navigateToSourceUrl();
        } else {
          navigateToSourceUrl();
        }
      }
    } else {
      if (Math.abs(verticalSwipeDistance) > 30) {
        // If user is scrolling summary and not at an edge, block card swipe
        if (isSummaryScrolling && !summaryScrollSwipeDirectionRef.current) {
          // User is still reading summary, don't swipe post
          return;
        }
        if (verticalSwipeDistance > 0) {
          setDirection(1);
          navigateToNextInsight();
        } else {
          setDirection(-1);
          navigateToPreviousInsight();
        }
      } else {
        setShowNavbar(!showNavbar);
        setShowTabNavigation(!showTabNavigation);
      }
    }
  };

  const handleInfluencerProfileSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      setShowingInfluencer(false);
      setCurrentInsightIndex(previousInsightIndex);
    }
  };

  const navigateToInfluencerDirectory = () => {
    navigate("/influencers");
  };

  const handleSummaryTouchStart = () => {
    setIsSummaryScrolling(true);
    setAllowCardSwipe(false);
  };

  const handleSummaryTouchEnd = () => {
    // Allow a brief delay before re-enabling card swipe
    setTimeout(() => {
      setIsSummaryScrolling(false);
      setAllowCardSwipe(true);
    }, 100);
  };

  const handleSummaryEdgeAttempt = (direction: "up" | "down") => {
    // When user reaches scroll edge and tries to continue, allow card swipe
    setAllowCardSwipe(true);
    
    // Trigger the appropriate navigation
    if (direction === "down") {
      navigateToNextInsight();
    } else {
      navigateToPreviousInsight();
    }
  };


  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading Bytes..." />;
  }

  if (Bytes.length === 0) {
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
      <div className={cn(
        "page-container",
        isDarkMode ? "bg-gray-900" : "bg-background"
      )}>
        <div className="p-4 pb-20 max-w-7xl mx-auto mt-10">
          <div className="space-y-6">
            {Bytes.map((bite, index) => {
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
                onClick={() => navigate(`/bytes/${bite.id}`)}
              >
                <div className="sm:flex">
                  <div className="sm:w-1/3 relative aspect-video sm:aspect-auto sm:h-full">
                    <img
                      src={bite.image}
                      alt={bite.title}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute top-2 right-2">
                      <ByteMeLogo size="sm" className="opacity-80" />
                    </div>
                    
                    <div className="absolute bottom-2 left-2 flex items-center bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
                      {bite.industry}
                    </div>
                    
                    {bite.source && (
                      <div 
                        className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-black/80 transition-colors text-white"
                      >
                        <PlatformIcon source={bite.source} />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 sm:w-2/3">
                    <div className="flex items-center mb-3">
                      <span className={cn(
                        "text-sm font-medium",
                        isDarkMode ? "text-gray-300" : "text-gray-700"
                      )}>
                        {bite.influencer.name}
                      </span>
                      <span className="mr-2"></span>
                      <span className={cn(
                        "text-xs",
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {timeAgo} ago
                      </span>
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
            )})}
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
      
      {!showingInfluencer ? (
        <>
          <div 
            className="swipe-container h-full w-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              setShowNavbar(!showNavbar);
              setShowTabNavigation(!showTabNavigation);
            }}
            ref={swipeContainerRef}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentInsightIndex}
                custom={direction}
                initial={{ y: direction === 1 ? 100 : -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: direction === 1 ? -100 : 100, opacity: 0 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="h-full w-full">
                   <InsightCard 
                  key={Bytes[currentInsightIndex].id}
                  insight={Bytes[currentInsightIndex]}
                  onSave={handleSaveInsight}
                  onLike={()=>{}}
                  onShare={handleShareInsight}
                  onFollowInfluencer={()=>{}}
                  onInfluencerClick={handleInfluencerClick}
                  onSourceClick={handleSourceClick}
                  userIndustries={selectedIndustries} 
                  position={""}
                  onClick={handleInsightClick}
                  onSummaryTouchStart={handleSummaryTouchStart}
                  onSummaryTouchEnd={handleSummaryTouchEnd}
                  onSummaryEdgeAttempt={handleSummaryEdgeAttempt}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </>
        ) : (
          selectedInfluencer && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              onTouchStart={handleTouchStart} 
              onTouchMove={handleTouchMove} 
              onTouchEnd={() => {
                const swipeDirection = touchStartX - touchMoveX > 40 ? 'left' : 
                                     touchMoveX - touchStartX > 40 ? 'right' : null;
                if (swipeDirection) {
                  handleInfluencerProfileSwipe(swipeDirection);
                }
              }}
            >
              <InfluencerProfile 
                influencer={selectedInfluencer}
                onFollowToggle={()=>{}}
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