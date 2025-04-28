
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFlow from "@/components/OnboardingFlow";
import InsightCard, { Insight } from "@/components/InsightCard";
import InfluencerProfile, { Influencer } from "@/components/InfluencerProfile";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";

const mockInsights: Insight[] = [
  {
    id: "1",
    title: "Why AI Governance Will Define the Next Decade of Tech",
    summary: "As AI systems become more powerful, the frameworks we create for governing them will shape our future. Companies leading in AI governance today will have the competitive edge tomorrow. Three core principles should guide our approach: transparency, accountability, and human oversight.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    industry: "AI",
    influencer: {
      id: "i1",
      name: "Alex Chen",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100",
      isFollowed: false
    },
    isSaved: false,
    isLiked: false
  },
  {
    id: "2",
    title: "Five Key Financial Metrics Every Startup Should Track",
    summary: "Beyond the obvious metrics like revenue and profit, startups should focus on customer acquisition cost (CAC), lifetime value (LTV), burn rate, runway, and conversion rates. These indicators collectively provide a comprehensive view of business health and sustainability.",
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d",
    industry: "Finance",
    influencer: {
      id: "i2",
      name: "Sarah Johnson",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100",
      isFollowed: true
    },
    isSaved: false,
    isLiked: false
  },
  {
    id: "3",
    title: "Remote Work Revolution: Building High-Performance Teams",
    summary: "The future of work isn't about location—it's about results. Top companies are shifting to outcome-based performance metrics rather than monitoring hours. Creating psychological safety through clear expectations and regular, meaningful check-ins is essential for remote team success.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    industry: "Business",
    influencer: {
      id: "i3",
      name: "Michael Torres",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100",
      isFollowed: false
    },
    isSaved: false,
    isLiked: false
  },
  {
    id: "4",
    title: "The Healthcare Breakthrough Nobody's Talking About",
    summary: "Predictive healthcare using AI and wearables is quietly revolutionizing preventive medicine. Early detection algorithms can now identify potential health issues weeks before symptoms appear, dramatically improving treatment outcomes while reducing costs by up to 60% for participating patients.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    industry: "Healthcare",
    influencer: {
      id: "i4",
      name: "Dr. Lisa Patel",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100",
      isFollowed: false
    },
    isSaved: false,
    isLiked: false
  },
  {
    id: "5",
    title: "Web3 Business Models: Beyond the Hype",
    summary: "Look past the cryptocurrency volatility to understand the true value proposition: decentralized ownership models that align incentives between creators, users, and investors. The most successful Web3 projects solve real problems while simplifying the user experience to near Web2 levels.",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55",
    industry: "Technology",
    influencer: {
      id: "i5",
      name: "David Nakamura",
      profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100",
      isFollowed: false
    },
    isSaved: false,
    isLiked: false
  }
];

const mockInfluencer: Influencer = {
  id: "i1",
  name: "Alex Chen",
  profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100",
  bio: "AI researcher and tech entrepreneur. Former lead at DeepMind. Passionate about ethical AI development and governance frameworks.",
  industry: "AI",
  followerCount: 248500,
  engagementScore: 9.8,
  isFollowed: false,
  recentInsights: [
    {
      id: "1",
      title: "Why AI Governance Will Define the Next Decade of Tech",
      summary: "As AI systems become more powerful, the frameworks we create for governing them will shape our future.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475"
    },
    {
      id: "6",
      title: "The Myth of AGI: What We Get Wrong About Machine Intelligence",
      summary: "The common conception of artificial general intelligence misunderstands both human and machine cognition.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485"
    },
    {
      id: "7",
      title: "Three AI Trends Every Business Leader Must Understand",
      summary: "The landscape of AI is rapidly evolving. Here's what decision-makers need to know about implementing AI responsibly.",
      image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b"
    }
  ]
};

const Index = () => {
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem("onboarded") === "true";
  });
  const [insights, setInsights] = useState<Insight[]>(mockInsights);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [showingInfluencer, setShowingInfluencer] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (showingInfluencer && selectedInfluencer?.id === "i1") {
      setSelectedInfluencer({
        ...mockInfluencer,
        isFollowed: insights.find(i => i.influencer.id === "i1")?.influencer.isFollowed || false
      });
    }
  }, [showingInfluencer, insights]);

  const handleOnboardingComplete = (selectedIndustries: string[]) => {
    localStorage.setItem("onboarded", "true");
    setOnboarded(true);
    
    toast({
      title: "Welcome to InfluenDoze!",
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
    const influencer = mockInfluencer;
    const isFollowed = insights.find(i => i.influencer.id === influencerId)?.influencer.isFollowed || false;
    
    setSelectedInfluencer({
      ...influencer,
      isFollowed
    });
    setShowingInfluencer(true);
  };
  
  const handleInsightClick = () => {
    setShowingInfluencer(false);
  };
  
  const navigateToNextInsight = () => {
    if (currentInsightIndex < insights.length - 1) {
      setCurrentInsightIndex(currentInsightIndex + 1);
    }
  };
  
  const navigateToPreviousInsight = () => {
    if (currentInsightIndex > 0) {
      setCurrentInsightIndex(currentInsightIndex - 1);
    }
  };
  
  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe up - next insight
      navigateToNextInsight();
    } else if (touchEnd - touchStart > 100) {
      // Swipe down - previous insight
      navigateToPreviousInsight();
    }
  };
  
  if (!onboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen bg-background">
      {!showingInfluencer ? (
        <div 
          className="swipe-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {insights.length > 0 && currentInsightIndex < insights.length && (
            <InsightCard 
              insight={insights[currentInsightIndex]}
              onSave={handleSaveInsight}
              onLike={handleLikeInsight}
              onShare={handleShareInsight}
              onFollowInfluencer={handleFollowInfluencer}
              onInfluencerClick={handleInfluencerClick}
            />
          )}
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
