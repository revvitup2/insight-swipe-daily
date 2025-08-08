import { useEffect, useMemo, useRef, useState } from "react";
import type { Insight } from "@/components/InsightCard";

// Session-based unseen counts for Trending and Following feeds
// - Counts posts published after the last session end
// - Hides badge for a tab once user visits that tab during current session
// - Updates last session end on tab/window close

export type FeedTab = "trending" | "following";

const getUserScopedKey = (base: string, userId?: string | null) =>
  userId ? `${base}:${userId}` : base;

export const useUnseenCounts = (
  params: {
    trending: Insight[];
    following: Insight[];
    userId?: string | null;
  }
) => {
  const { trending, following, userId = null } = params;
  const LAST_SESSION_END_KEY = getUserScopedKey("feed_last_session_end", userId);
  const SESSION_START_KEY = getUserScopedKey("feed_session_start", userId);
  const SEEN_TABS_KEY = getUserScopedKey("feed_seen_tabs", userId);

  const [seenTabs, setSeenTabs] = useState<Record<FeedTab, boolean>>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SEEN_TABS_KEY) || "{}");
    } catch {
      return {} as Record<FeedTab, boolean>;
    }
  });

  // Ensure session start exists
  useEffect(() => {
    const existing = sessionStorage.getItem(SESSION_START_KEY);
    if (!existing) {
      sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }
  }, [SESSION_START_KEY]);

  // On unload, mark session end
  const wroteSessionEndRef = useRef(false);
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (wroteSessionEndRef.current) return;
      localStorage.setItem(LAST_SESSION_END_KEY, Date.now().toString());
      wroteSessionEndRef.current = true;
      // Clear session flags for next session
      sessionStorage.removeItem(SEEN_TABS_KEY);
      sessionStorage.removeItem(SESSION_START_KEY);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [LAST_SESSION_END_KEY, SEEN_TABS_KEY, SESSION_START_KEY]);

  // Compute baseline timestamp for unseen (last session end)
  const lastSessionEnd = useMemo(() => {
    const raw = localStorage.getItem(LAST_SESSION_END_KEY);
    if (!raw) return 0; // If never ended a session, treat as 0 => everything is seen
    const ts = parseInt(raw, 10);
    return Number.isFinite(ts) ? ts : 0;
  }, [LAST_SESSION_END_KEY]);

  const countUnseen = (list: Insight[]) => {
    if (!Array.isArray(list) || list.length === 0) return 0;
    if (!lastSessionEnd) return 0; // First session => no badge
    return list.reduce((acc, item) => {
      const published = item?.publishedAt ? Date.parse(item.publishedAt) : 0;
      return published > lastSessionEnd ? acc + 1 : acc;
    }, 0);
  };

  const trendingCountRaw = useMemo(() => countUnseen(trending), [trending, lastSessionEnd]);
  const followingCountRaw = useMemo(() => countUnseen(following), [following, lastSessionEnd]);

  // Hide if visited during this session
  const trendingCount = seenTabs.trending ? 0 : trendingCountRaw;
  const followingCount = seenTabs.following ? 0 : followingCountRaw;

  const followingBadgeText = followingCount > 9 ? "9+" : followingCount > 0 ? String(followingCount) : "";

  const markTabVisited = (tab: FeedTab) => {
    setSeenTabs((prev) => {
      const next = { ...prev, [tab]: true } as Record<FeedTab, boolean>;
      sessionStorage.setItem(SEEN_TABS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return {
    trendingCount,
    followingCount,
    followingBadgeText,
    markTabVisited,
  };
};
