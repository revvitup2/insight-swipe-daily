"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar, 
  BookOpen, 
  Trophy, 
  Award, 
  Target, 
  TrendingUp,
  Star,
  Flame,
  Users,
  Crown,
  Zap,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressStats {
  dailyStreak: number;
  totalBytesConsumed: number;
  totalDaysActive: number;
  categoriesExplored: number;
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  currentProgress: number;
  category: "bytes" | "days" | "categories" | "streak";
  unlocked: boolean;
}

interface BadgeType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "habits" | "mastery" | "consistency" | "special";
  unlocked: boolean;
  unlockedAt?: string;
}

const Progress = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // Enhanced dummy data for design preview
  const [stats, setStats] = useState<ProgressStats>({
    dailyStreak: 14,
    totalBytesConsumed: 87,
    totalDaysActive: 23,
    categoriesExplored: 8,
    weeklyGoal: 7,
    weeklyProgress: 6,
    monthlyGoal: 30,
    monthlyProgress: 24
  });

  const milestones: Milestone[] = [
    {
      id: "first-byte",
      title: "First Byte",
      description: "Read your very first Byte",
      icon: <BookOpen className="w-6 h-6" />,
      requirement: 1,
      currentProgress: stats.totalBytesConsumed,
      category: "bytes",
      unlocked: stats.totalBytesConsumed >= 1
    },
    {
      id: "byte-explorer",
      title: "Byte Explorer",
      description: "Consume 25 Bytes to unlock deeper insights",
      icon: <Brain className="w-6 h-6" />,
      requirement: 25,
      currentProgress: stats.totalBytesConsumed,
      category: "bytes",
      unlocked: stats.totalBytesConsumed >= 25
    },
    {
      id: "knowledge-seeker",
      title: "Knowledge Seeker",
      description: "Read 50 Bytes and become a learning machine",
      icon: <Star className="w-6 h-6" />,
      requirement: 50,
      currentProgress: stats.totalBytesConsumed,
      category: "bytes",
      unlocked: stats.totalBytesConsumed >= 50
    },
    {
      id: "week-warrior",
      title: "Week Warrior",
      description: "Maintain a 7-day reading streak",
      icon: <Flame className="w-6 h-6" />,
      requirement: 7,
      currentProgress: stats.dailyStreak,
      category: "streak",
      unlocked: stats.dailyStreak >= 7
    },
    {
      id: "category-collector",
      title: "Category Collector",
      description: "Explore 5 different learning categories",
      icon: <Target className="w-6 h-6" />,
      requirement: 5,
      currentProgress: stats.categoriesExplored,
      category: "categories",
      unlocked: stats.categoriesExplored >= 5
    }
  ];

  const badges: BadgeType[] = [
    {
      id: "early-adopter",
      title: "Early Adopter",
      description: "Joined ByteMe in its early days",
      icon: <Crown className="w-5 h-5" />,
      category: "special",
      unlocked: true,
      unlockedAt: "2024-01-15"
    },
    {
      id: "first-byte-badge",
      title: "First Byte",
      description: "Read your first Byte",
      icon: <BookOpen className="w-5 h-5" />,
      category: "habits",
      unlocked: true,
      unlockedAt: "2024-01-20"
    },
    {
      id: "weekly-streak",
      title: "7-Day Streak",
      description: "Maintained a 7-day learning streak",
      icon: <Flame className="w-5 h-5" />,
      category: "consistency",
      unlocked: true,
      unlockedAt: "2024-01-27"
    },
    {
      id: "50-bytes",
      title: "50 Bytes Read",
      description: "Consumed 50 learning Bytes",
      icon: <Star className="w-5 h-5" />,
      category: "habits",
      unlocked: true,
      unlockedAt: "2024-02-05"
    },
    {
      id: "ai-native",
      title: "AI Native",
      description: "Read 30 AI-focused Bytes",
      icon: <Zap className="w-5 h-5" />,
      category: "mastery",
      unlocked: true,
      unlockedAt: "2024-02-10"
    },
    {
      id: "category-explorer",
      title: "Category Explorer",
      description: "Explored 5+ different categories",
      icon: <Target className="w-5 h-5" />,
      category: "mastery",
      unlocked: true,
      unlockedAt: "2024-02-12"
    },
    {
      id: "top-learner",
      title: "Top AI Learner",
      description: "Among top 10% in AI category",
      icon: <Trophy className="w-5 h-5" />,
      category: "mastery",
      unlocked: false
    },
    {
      id: "streak-master",
      title: "Streak Master",
      description: "Achieve a 30-day streak",
      icon: <Flame className="w-5 h-5" />,
      category: "consistency",
      unlocked: false
    }
  ];

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Ready to start your learning journey?";
    if (streak >= 30) return `🔥 Incredible! ${streak}-day streak!`;
    if (streak >= 14) return `🚀 Amazing! ${streak}-day streak!`;
    if (streak >= 7) return `⚡ You're on fire! ${streak}-day streak`;
    if (streak >= 3) return `💪 Building momentum! ${streak}-day streak`;
    return `🌟 Great start! ${streak}-day streak`;
  };

  const getBytesContext = (count: number) => {
    if (count >= 100) return "You're a ByteMe power user! 🏆";
    if (count >= 50) return "That's more than 90% of users! 📊";
    if (count >= 25) return "You're learning faster than ever! 🚀";
    if (count >= 10) return "Great progress on your journey! 🌟";
    return "Every Byte makes you smarter! 💡";
  };

  // Removed authentication requirement for design preview

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and celebrate your achievements
          </p>
        </div>

        {/* Daily Streak */}
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              Daily Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.dailyStreak}
              </div>
              <p className="text-lg font-medium mb-1">
                {getStreakMessage(stats.dailyStreak)}
              </p>
              <p className="text-sm text-muted-foreground">
                Keep reading daily to maintain your streak
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Bytes Consumed */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
              Total Bytes Consumed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">
                {stats.totalBytesConsumed}
              </div>
              <p className="text-lg font-medium mb-1">
                {getBytesContext(stats.totalBytesConsumed)}
              </p>
              <p className="text-sm text-muted-foreground">
                Bytes read since you joined
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5" />
                Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{stats.weeklyProgress} / {stats.weeklyGoal} Bytes</span>
                  <span>{Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)}%</span>
                </div>
                <ProgressBar 
                  value={(stats.weeklyProgress / stats.weeklyGoal) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {stats.weeklyGoal - stats.weeklyProgress} more to complete your weekly goal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-5 h-5" />
                Monthly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{stats.monthlyProgress} / {stats.monthlyGoal} Bytes</span>
                  <span>{Math.round((stats.monthlyProgress / stats.monthlyGoal) * 100)}%</span>
                </div>
                <ProgressBar 
                  value={(stats.monthlyProgress / stats.monthlyGoal) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {stats.monthlyGoal - stats.monthlyProgress} more to complete your monthly goal
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border",
                    milestone.unlocked 
                      ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" 
                      : "bg-muted/30 border-border"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    milestone.unlocked 
                      ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {milestone.unlocked ? <Award className="w-6 h-6" /> : milestone.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{milestone.title}</h4>
                      {milestone.unlocked && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{milestone.description}</p>
                    {!milestone.unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{milestone.currentProgress} / {milestone.requirement}</span>
                          <span>{Math.round((milestone.currentProgress / milestone.requirement) * 100)}%</span>
                        </div>
                        <ProgressBar 
                          value={(milestone.currentProgress / milestone.requirement) * 100} 
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Award className="w-6 h-6" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border text-center transition-all",
                    badge.unlocked
                      ? "bg-background border-border hover:border-primary/50 cursor-pointer"
                      : "bg-muted/30 border-muted opacity-60"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-full mb-3",
                    badge.unlocked
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {badge.icon}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{badge.title}</h4>
                  <p className="text-xs text-muted-foreground text-center leading-tight">
                    {badge.description}
                  </p>
                  {badge.unlocked && badge.unlockedAt && (
                    <p className="text-xs text-primary mt-2">
                      Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Future Leaderboard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Compete with top learners and see how you rank globally
              </p>
              <Button variant="outline" disabled>
                Join Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Navigation />
    </div>
  );
};

export default Progress;