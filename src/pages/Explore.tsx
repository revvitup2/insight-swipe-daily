"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "lucide-react";
import { ByteCard } from "@/components/ui/bytmecard";
import { useSavedInsights } from "@/components/savedInsightUtils";

interface Insight {
  id: string;
  title: string;
  summary: string;
  image: string;
  industry: string;
  publishedAt: string;
  influencer: {
    name: string;
  };
  isSaved: boolean;
  source: "youtube" | "twitter" | "linkedin" | "other";
}

const industries = [
  "Finance",
  "AI",
  "Healthcare",
  "Startups",
  "Business",
  "Technology",
  "Marketing",
  "Design",
  "Others",
];

const Explore = () => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [allInsights, setAllInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
    const { handleSaveInsightInApi } = useSavedInsights();

  useEffect(() => {
    const fetchAllBytes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed`);
        const data = await response.json();
        
        const formattedBytes: Insight[] = data.map((item: any) => {
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
          
          return {
            id: item.video_id,
            title: item.metadata.title,
            summary: item.analysis.summary,
            image: item.metadata.thumbnails.high.url,
            industry: item.industry || "General",
            influencer: {
              name: item.metadata.channel_title,
            },
            isSaved: false,
            source: sourcePlatform,
            publishedAt: item.published_at,
          };
        });

        setAllInsights(formattedBytes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching bytes:", error);
        toast({
          title: "Error",
          description: "Failed to fetch bytes. Please try again later.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchAllBytes();
  }, []);

const handleSave = async (id: string) => {
    
    const newSavedStatus = await handleSaveInsightInApi(id);

};

   const handleShare = async (id: string) => {
    const bite = allInsights.find(i => i.id === id);
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

      const shareUrl = `${window.location.origin}/bytes/${bite.id}`;
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
        // Desktop fallback
        const imageUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = imageUrl;
        downloadLink.download = 'byte-me-insight.png';
        document.body.appendChild(downloadLink);

        toast({
          title: "Share this Byte",
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
      toast({
        title: "Error",
        description: "Could not share this byte",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };


  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((item) => item !== industry)
        : [...prev, industry]
    );
  };

  const filteredBytes = allInsights.filter((insight) => {
    if (selectedIndustries.length === 0) return true;
    return selectedIndustries.some((industry) =>
      insight.industry.toLowerCase().includes(industry.toLowerCase())
    );
  });

  const handleClick = (id: string) => {
    navigate(`/bytes/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-primary">Loading Bytes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isSharing && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-primary">Preparing share content...</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto py-6 md:py-12 px-4 pb-20 md:pb-6">
        <h1 className="text-3xl font-bold mb-6 text-primary">Explore Bytes</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Filter by Industry</h2>
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <Button
                key={industry}
                variant="outline"
                className={selectedIndustries.includes(industry) ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}
                onClick={() => toggleIndustry(industry)}
              >
                {industry}
                {selectedIndustries.includes(industry) && (
                  <Badge className="ml-2">
                    {filteredBytes.filter((insight) =>
                      insight.industry.toLowerCase().includes(industry.toLowerCase())
                    ).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3">
            {filteredBytes.length > 0 ? "Filtered Bytes" : "All Bytes"}
          </h2>
          
          <div className="space-y-6">
            {filteredBytes.map((bite) => (
              <ByteCard
                key={bite.id}
                bite={bite}
                isDarkMode={isDarkMode}
                onSave={()=>{handleSave(bite.id)}}
                onShare={handleShare}
                onClick={handleClick}
              />
            ))}
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
                onClick={() => setSelectedIndustries([])}
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
      </div>
      
      <Navigation />
    </div>
  );
};

export default Explore;