import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, TrendingUp } from "lucide-react";

interface FeedTabsProps {
  activeTab: "trending" | "following";
  onTabChange: (tab: "trending" | "following") => void;
  followedCount?: number;
}

export const FeedTabs = ({ activeTab, onTabChange, followedCount = 0 }: FeedTabsProps) => {
  return (
    <div className="flex items-center justify-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange("trending")}
        data-tab="trending"
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-md transition-all",
          activeTab === "trending"
            ? "bg-primary text-white dark:bg-gray-700 dark:text-white shadow-sm"
            : "text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        )}
      >
        <TrendingUp className="w-4 h-4" />
        Trending
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onTabChange("following")}
        data-tab="following"
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-md transition-all",
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