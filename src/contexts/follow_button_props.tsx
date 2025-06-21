"use client";

import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthActions } from "./authUtils";

interface FollowButtonProps {
  isFollowing: boolean;
  isLoading: boolean;
  onClick: (e: React.MouseEvent) => Promise<void>;
  className?: string;
  size?: "sm" | "default";
}

export const FollowButton = ({
  isFollowing,
  isLoading,
  onClick,
  className,
  size = "sm",
}: FollowButtonProps) => {
  const { requireAuth } = useAuthActions();

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await requireAuth(async () => {
        if (onClick) {
          await onClick(e);
        }
      });
    } catch (error) {
      console.error("Authentication required:", error);
    }
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200",
        isFollowing
          ? "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
          : "bg-primary hover:bg-primary text-white",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-3 h-3 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-3 h-3 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
};