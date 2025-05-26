"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Youtube, Twitter, Linkedin, Bookmark, Share2 } from "lucide-react";
import ByteMeLogo from "@/components/ByteMeLogo";
import { formatDistanceToNow } from "date-fns";
import { CURRENT_INSIGHT_VERSION } from "@/constants/constants";
import { motion } from "framer-motion";

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
      maxres?: {
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

interface Insight {
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
  isSaved: boolean;
  isLiked: boolean;
  keyPoints: string[];
  sentiment: string;
  publishedAt: string;
  source?: "youtube" | "twitter" | "linkedin" | "other";
  sourceUrl?: string;
}

interface SavedBytesData {
  versions: {
    [version: number]: Insight[];
  };
}

const PlatformIcon = ({ source }: { source: string }) => {
  const iconProps = { className: "w-5 h-5", strokeWidth: 2 };

  switch (source) {
    case "youtube":
      return <Youtube {...iconProps} />;
    case "twitter":
      return <Twitter {...iconProps} />;
    case "linkedin":
      return <Linkedin {...iconProps} />;
    default:
      return null;
  }
};

const InsightDetails = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [insight, setInsight] = useState<ApiInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const insightCardRef = useRef<HTMLDivElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchInsightDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed/video/${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch insight details');
        }
        const data: ApiInsight = await response.json();
        setInsight(data);
        
        // Check if this insight is already saved
        const savedData: SavedBytesData = JSON.parse(
          localStorage.getItem("savedBytes") || '{"versions":{}}'
        );
        const savedBytes = savedData.versions[CURRENT_INSIGHT_VERSION] || [];
        const isAlreadySaved = savedBytes.some(i => i.id === videoId);
        setIsSaved(isAlreadySaved);
      } catch (error) {
        console.error("Error fetching insight details:", error);
        toast({
          title: "Error",
          description: "Failed to load insight details. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchInsightDetails();
    }
  }, [videoId]);

  const handleSaveInsight = () => {
    if (!insight) return;

    const savedData: SavedBytesData = JSON.parse(
      localStorage.getItem("savedBytes") || '{"versions":{}}'
    );

    // Initialize version if it doesn't exist
    if (!savedData.versions[CURRENT_INSIGHT_VERSION]) {
      savedData.versions[CURRENT_INSIGHT_VERSION] = [];
    }

    const formattedInsight: Insight = {
      id: insight.video_id,
      title: insight.metadata.title,
      summary: insight.analysis.summary,
      image: insight.metadata.thumbnails.high.url,
      industry: insight.industry || "General",
      influencer: {
        id: insight.influencer_id,
        name: insight.metadata.channel_title,
        profileImage: "https://ui-avatars.com/api/?name=" + encodeURIComponent(insight.metadata.channel_title),
        isFollowed: false
      },
      isSaved: true,
      isLiked: false,
      keyPoints: insight.analysis.key_points,
      sentiment: insight.analysis.sentiment,
      publishedAt: insight.published_at,
      source: insight.source?.platform,
      sourceUrl: insight.source?.url || `https://youtube.com/watch?v=${insight.video_id}`
    };

    if (!isSaved) {
      // Add to saved Bytes
      savedData.versions[CURRENT_INSIGHT_VERSION] = [
        ...savedData.versions[CURRENT_INSIGHT_VERSION].filter(i => i.id !== insight.video_id),
        formattedInsight
      ];
      toast({
        title: "Saved",
        description: `Added to saved`,
      });
    } else {
      // Remove from saved Bytes
      savedData.versions[CURRENT_INSIGHT_VERSION] = 
        savedData.versions[CURRENT_INSIGHT_VERSION].filter(i => i.id !== insight.video_id);
      toast({
        title: "Removed from saved",
        description: "Removed from your saved",
      });
    }

    localStorage.setItem("savedBytes", JSON.stringify(savedData));
    setIsSaved(!isSaved);
  };

  const handleShareInsight = async () => {
    if (!insight || !insightCardRef.current) return;

    try {
      setIsSharing(true);
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(insightCardRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      if (!blob) {
        setIsSharing(false);
        return;
      }

      const shareUrl = `${window.location.origin}/Bytes/${insight.video_id}`;
      const shareText = `${insight.metadata.title}\n\n${insight.analysis.summary.substring(0, 100)}...\n\nTo read more insightful Bytes in less than 60 words, visit: ${shareUrl}`;
      const file = new File([blob], 'insight.png', { type: 'image/png' });

      // Check support for full share with image
      const canShareWithImage = navigator.canShare && navigator.canShare({ files: [file] });

      if (navigator.share) {
        if (canShareWithImage) {
          await navigator.share({
            title: insight.metadata.title,
            text: shareText,
            url: shareUrl,
            files: [file],
          });
        } else {
          // Fallback to just text and link if image share isn't supported
          await navigator.share({
            title: insight.metadata.title,
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
                  alt={insight.metadata.title} 
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
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading insight details..." />;
  }

  if (!insight) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Insight Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The insight you're looking for doesn't exist or may have been removed.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(insight.published_at), { addSuffix: true });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hidden card for screenshot */}
      <div className="fixed top-[-9999px] left-[-9999px]">
        <div 
          ref={insightCardRef}
          className="w-[350px] bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="relative">
            <img
              src={insight.metadata.thumbnails.maxres?.url || insight.metadata.thumbnails.high.url}
              alt={insight.metadata.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute top-2 right-2">
              <ByteMeLogo size="sm" />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1 line-clamp-2">
              {insight.metadata.title}
            </h3>
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <span>{timeAgo}</span>
              <span className="mx-1">•</span>
              <span className="capitalize">{insight.industry}</span>
            </div>
            <p className="text-sm line-clamp-10">
              {insight.analysis.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Actual detail view */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden"
      >
        {/* Video Thumbnail */}
        <div className="relative">
          <img
            src={insight.metadata.thumbnails.maxres?.url || insight.metadata.thumbnails.high.url}
            alt={insight.metadata.title}
            className="w-full h-auto max-h-96 object-cover"
          />
          <div className="absolute top-4 right-4">
            <ByteMeLogo size="md" />
          </div>
      <div className="absolute bottom-4 right-4 flex space-x-2">
  <Button
    variant="secondary"
    size="icon"
    onClick={handleSaveInsight}
    disabled={isSharing}
    className="bg-black hover:bg-gray-800"
  >
    <Bookmark className="w-5 h-5 text-white" />
  </Button>
  <Button
    variant="secondary"
    size="icon"
    onClick={handleShareInsight}
    disabled={isSharing}
    className="bg-black hover:bg-gray-800"
  >
    <Share2 className="w-5 h-5 text-white" />
  </Button>
</div>

        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and Metadata */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {insight.metadata.title}
              </h1>
              {insight.source && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(insight.source?.url, '_blank')}
                >
                  <PlatformIcon source={insight.source.platform} />
                  <span className="ml-2">View on {insight.source.platform}</span>
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{timeAgo}</span>
              <span>•</span>
              <span className="capitalize">{insight.industry}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {insight.analysis.summary}
            </p>
          </div>

          {/* Key Points */}
          {insight.analysis.key_points && insight.analysis.key_points.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Key Points
              </h2>
              <ul className="space-y-2">
                {insight.analysis.key_points.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Channel Info */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              About the Creator
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-lg">
                  {insight.metadata.channel_title.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {insight.metadata.channel_title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {insight.industry} Content Creator
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sharing loading overlay */}
      {isSharing && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-primary">Preparing share content...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightDetails;