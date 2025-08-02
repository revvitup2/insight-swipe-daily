
import { Button } from "@/components/ui/button";
import { Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmptyFollowingState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
        No Following Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        Start following influencers to see their latest content in your personalized feed.
      </p>
      <Button
        onClick={() => navigate("/influencers")}
        className="flex items-center gap-2"
      >
        <Search className="w-4 h-4" />
        Discover Influencers
      </Button>
    </div>
  );
};