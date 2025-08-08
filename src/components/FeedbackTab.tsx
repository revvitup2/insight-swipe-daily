import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, TrendingUp } from "lucide-react";

interface FeedTabsProps {
  activeTab: "trending" | "following";
  onTabChange: (tab: "trending" | "following") => void;
  followedCount?: number;
  trendingUnseenCount?: number; // new unseen count for trending
  followingUnseenBadge?: string; // new unseen badge text for following (e.g., "9+")
}

export const FeedTabs = ({ activeTab, onTabChange, followedCount = 0, trendingUnseenCount = 0, followingUnseenBadge = "" }: FeedTabsProps) => {
  return (
    <div className="flex items-center justify-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange("trending")}
        data-tab="trending"
        className={cn(
          "relative flex-1 flex items-center justify-center gap-2 rounded-md transition-all",
          activeTab === "trending"
            ? "bg-primary text-white dark:bg-gray-700 dark:text-white shadow-sm"
            : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        )}
      >
        <TrendingUp className="w-4 h-4" />
        <span>Trending</span>
        {trendingUnseenCount > 0 && (
          <span
            aria-label={`${trendingUnseenCount} new trending posts`}
            className={cn(
              "ml-2 inline-flex min-w-[1.25rem] h-5 px-1 items-center justify-center rounded-full text-[10px] font-medium",
              "bg-primary/15 text-primary border border-primary/20"
            )}
          >
            {trendingUnseenCount}
          </span>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange("following")}
        data-tab="following"
        className={cn(
          "relative flex-1 flex items-center justify-center gap-2 rounded-md transition-all",
          activeTab === "following"
            ? "bg-white text-gray-900 dark:bg-gray-700 dark:text-white shadow-sm"
            : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        )}
      >
        <Users className="w-4 h-4" />
        Following {followedCount > 0 && `(${followedCount})`}
      </Button>
    </div>
  );
};