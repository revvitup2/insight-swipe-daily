

"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import SavedInsightsCard from "@/components/SavedInsightsCard";
import { cn } from "@/lib/utils";

// Mock data for saved insights
const mockSavedInsights = [
  {
    id: "1",
    title: "The Future of AI in Finance",
    summary: "Exploring how artificial intelligence is revolutionizing the financial sector with automated trading, risk assessment, and personalized banking experiences.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    industry: "AI",
    influencer: {
      id: "inf1",
      name: "Dr. Sarah Chen",
      channel_id: "ai_finance_expert",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      isFollowed: true,
    },
    isSaved: true,
    isLiked: false,
    keyPoints: [
      "AI reduces fraud by 40%",
      "Automated trading increases efficiency",
      "Personalized banking improves customer satisfaction"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-15T10:30:00Z",
    source: "youtube" as const,
    sourceUrl: "https://youtube.com/watch?v=example1",
  },
  {
    id: "2",
    title: "Startup Funding Strategies for 2024",
    summary: "Key insights on securing venture capital, understanding market trends, and building investor relationships in the current economic climate.",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
    industry: "Startups",
    influencer: {
      id: "inf2",
      name: "Alex Rodriguez",
      channel_id: "startup_guru",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      isFollowed: false,
    },
    isSaved: true,
    isLiked: true,
    keyPoints: [
      "Pre-seed funding increased 25%",
      "Focus on sustainable growth metrics",
      "Build relationships before you need funding"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-14T14:20:00Z",
    source: "twitter" as const,
    sourceUrl: "https://twitter.com/example/status/123",
  },
  {
    id: "3",
    title: "Healthcare Innovation Through Technology",
    summary: "How telemedicine, AI diagnostics, and wearable devices are transforming patient care and medical research methodologies.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
    industry: "Healthcare",
    influencer: {
      id: "inf3",
      name: "Dr. Emily Watson",
      channel_id: "healthtech_insights",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      isFollowed: true,
    },
    isSaved: true,
    isLiked: false,
    keyPoints: [
      "Telemedicine adoption up 300%",
      "AI diagnostics reduce errors by 50%",
      "Wearables enable preventive care"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-13T09:45:00Z",
    source: "linkedin" as const,
    sourceUrl: "https://linkedin.com/posts/example",
  },
  {
    id: "4",
    title: "Marketing Trends for Digital Businesses",
    summary: "Understanding consumer behavior shifts, social media algorithms, and emerging platforms for effective digital marketing strategies.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    industry: "Marketing",
    influencer: {
      id: "inf4",
      name: "Jessica Kim",
      channel_id: "digital_marketing_pro",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isFollowed: false,
    },
    isSaved: true,
    isLiked: true,
    keyPoints: [
      "Video content drives 80% engagement",
      "Micro-influencers outperform celebrities",
      "Personalization increases conversion 15%"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-12T16:30:00Z",
    source: "youtube" as const,
    sourceUrl: "https://youtube.com/watch?v=example4",
  },
  {
    id: "5",
    title: "Design Systems and User Experience",
    summary: "Building scalable design systems, understanding user psychology, and creating intuitive interfaces for modern applications.",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
    industry: "Design",
    influencer: {
      id: "inf5",
      name: "Carlos Mendoza",
      channel_id: "ux_design_master",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isFollowed: true,
    },
    isSaved: true,
    isLiked: false,
    keyPoints: [
      "Design systems improve consistency 60%",
      "User testing reduces development costs",
      "Accessibility drives inclusive growth"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-11T11:15:00Z",
    source: "twitter" as const,
    sourceUrl: "https://twitter.com/example/status/456",
  },
  {
    id: "6",
    title: "Blockchain and Cryptocurrency Updates",
    summary: "Latest developments in blockchain technology, cryptocurrency regulations, and decentralized finance opportunities for investors.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
    industry: "Finance",
    influencer: {
      id: "inf6", 
      name: "Michael Chang",
      channel_id: "crypto_analyst",
      profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      isFollowed: false,
    },
    isSaved: true,
    isLiked: true,
    keyPoints: [
      "DeFi protocols show 200% growth",
      "Regulatory clarity improves adoption",
      "Layer 2 solutions reduce transaction costs"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-10T13:00:00Z",
    source: "linkedin" as const,
    sourceUrl: "https://linkedin.com/posts/crypto-example",
  },
  {
    id: "7",
    title: "Business Strategy in Remote Work Era",
    summary: "Adapting business models for remote-first environments, managing distributed teams, and maintaining company culture digitally.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    industry: "Business",
    influencer: {
      id: "inf7",
      name: "Lisa Thompson",
      channel_id: "business_strategist",
      profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      isFollowed: true,
    },
    isSaved: true,
    isLiked: false,
    keyPoints: [
      "Remote work productivity up 35%",
      "Digital collaboration tools essential",
      "Company culture requires intentional design"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-09T15:45:00Z",
    source: "youtube" as const,
    sourceUrl: "https://youtube.com/watch?v=business-remote",
  },
  {
    id: "8",
    title: "Technology Infrastructure and Cloud Computing",
    summary: "Exploring cloud architecture, serverless computing, and infrastructure as code for scalable application development.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
    industry: "Technology",
    influencer: {
      id: "inf8",
      name: "David Park",
      channel_id: "cloud_architect",
      profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      isFollowed: false,
    },
    isSaved: true,
    isLiked: true,
    keyPoints: [
      "Serverless reduces costs by 70%",
      "Multi-cloud strategies increase reliability",
      "Infrastructure as code improves deployment"
    ],
    sentiment: "positive",
    publishedAt: "2024-01-08T10:20:00Z",
    source: "twitter" as const,
    sourceUrl: "https://twitter.com/tech-example",
  }
];

const industries = [
  "All",
  "Finance", 
  "AI",
  "Healthcare",
  "Startups",
  "Business",
  "Technology",
  "Marketing",
  "Design",
  "Others"
];

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["All"]);
  const [savedInsights, setSavedInsights] = useState(mockSavedInsights);
  const [showFilters, setShowFilters] = useState(false);

  // Load saved insights from localStorage on component mount
  useEffect(() => {
    const storedSaved = localStorage.getItem("savedInsights");
    if (storedSaved) {
      try {
        const parsed = JSON.parse(storedSaved);
        setSavedInsights(parsed);
      } catch (error) {
        console.error("Error parsing saved insights:", error);
        setSavedInsights(mockSavedInsights);
      }
    }
  }, []);

  const filteredInsights = useMemo(() => {
    return savedInsights.filter(insight => {
      const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          insight.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          insight.influencer.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIndustry = selectedIndustries.includes("All") || 
                            selectedIndustries.some(selected => 
                              insight.industry.toLowerCase().includes(selected.toLowerCase())
                            );
      
      return matchesSearch && matchesIndustry;
    });
  }, [savedInsights, searchTerm, selectedIndustries]);

  const handleIndustryToggle = (industry: string) => {
    if (industry === "All") {
      setSelectedIndustries(["All"]);
    } else {
      setSelectedIndustries(prev => {
        const filtered = prev.filter(i => i !== "All");
        if (filtered.includes(industry)) {
          const newSelection = filtered.filter(i => i !== industry);
          return newSelection.length === 0 ? ["All"] : newSelection;
        } else {
          return [...filtered, industry];
        }
      });
    }
  };

  const clearFilters = () => {
    setSelectedIndustries(["All"]);
    setSearchTerm("");
  };

  const handleUnsave = (id: string) => {
    const updatedInsights = savedInsights.filter(insight => insight.id !== id);
    setSavedInsights(updatedInsights);
    localStorage.setItem("savedInsights", JSON.stringify(updatedInsights));
    
    toast({
      title: "Insight removed",
      description: "The insight has been removed from your saved items",
    });
  };

  const handleLike = (id: string) => {
    const updatedInsights = savedInsights.map(insight => {
      if (insight.id === id) {
        return { ...insight, isLiked: !insight.isLiked };
      }
      return insight;
    });
    setSavedInsights(updatedInsights);
    localStorage.setItem("savedInsights", JSON.stringify(updatedInsights));
  };

  const handleShare = (id: string) => {
    const insight = savedInsights.find(i => i.id === id);
    if (insight && navigator.share) {
      navigator.share({
        title: insight.title,
        text: insight.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Insight link has been copied to clipboard",
      });
    }
  };

  const getIndustryIcon = (industry: string) => {
    const industryLower = industry.toLowerCase();
    if (industryLower.includes('finance')) return "💰";
    if (industryLower.includes('ai') || industryLower.includes('artificial')) return "🤖";
    if (industryLower.includes('health')) return "🏥";
    if (industryLower.includes('startup')) return "🚀";
    if (industryLower.includes('business')) return "💼";
    if (industryLower.includes('market')) return "📢";
    if (industryLower.includes('design')) return "🎨";
    if (industryLower.includes('technology') || industryLower.includes('tech')) return "💻";
    if (industryLower.includes('others') || industryLower.includes('other')) return "📌";
    return "📌";
  }

  const hasActiveFilters = selectedIndustries.length > 1 || !selectedIndustries.includes("All") || searchTerm;

  return (
    <div className="page-container bg-background">
      <div className="p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search insights, influencers, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Filter Tags */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {industries.map((industry) => (
                <Badge
                  key={industry}
                  variant={selectedIndustries.includes(industry) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedIndustries.includes(industry) 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  )}
                  onClick={() => handleIndustryToggle(industry)}
                >
                  {industry !== "All" && getIndustryIcon(industry)} {industry}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''} found
            {hasActiveFilters && (
              <span className="ml-2">
                • {selectedIndustries.includes("All") ? "All categories" : selectedIndustries.join(", ")}
                {searchTerm && ` • "${searchTerm}"`}
              </span>
            )}
          </p>
        </div>

        {/* Insights Grid */}
        {filteredInsights.length > 0 ? (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <SavedInsightsCard
                key={insight.id}
                insight={insight}
                onUnsave={handleUnsave}
                onLike={handleLike}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">No insights found</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters 
                ? "Try adjusting your search terms or filters"
                : "Start saving insights to see them here"
              }
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default Explore;

