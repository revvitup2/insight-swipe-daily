import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Home, Bookmark, Search, User, TrendingUp, Users, Plus, Heart, Share, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AppTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  highlightSelector?: string;
  icon: React.ReactNode;
  position: "center" | "top" | "bottom";
  route?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to ByteMe!",
    description: "Get the latest AI insights in bite-sized chunks. Let's take a quick tour of the app.",
    icon: <Home className="w-6 h-6" />,
    position: "center"
  },
  {
    id: "home-page",
    title: "Home Page",
    description: "This is your main feed where you'll discover AI insights from top influencers.",
    icon: <Home className="w-6 h-6" />,
    position: "center",
    route: "/"
  },
  {
    id: "trending-tab",
    title: "Trending Tab",
    description: "See the most popular AI insights trending right now across all categories.",
    icon: <TrendingUp className="w-6 h-6" />,
    position: "top",
    highlightSelector: "[data-tab='trending']"
  },
  {
    id: "following-tab",
    title: "Following Tab", 
    description: "View insights only from influencers you follow. Personalized content just for you.",
    icon: <Users className="w-6 h-6" />,
    position: "top",
    highlightSelector: "[data-tab='following']"
  },
  {
    id: "swipe-gestures",
    title: "Swipe Navigation",
    description: "Swipe up/down to navigate between insights. Swipe left to see influencer profile, right to view source.",
    icon: <ArrowRight className="w-6 h-6" />,
    position: "center"
  },
  {
    id: "card-actions",
    title: "Insight Actions",
    description: "Like, save, or share insights. Tap the heart to like, bookmark to save, and share icon to share.",
    icon: <Heart className="w-6 h-6" />,
    position: "bottom"
  },
  {
    id: "saved-tab",
    title: "Saved Insights",
    description: "Access all your saved insights here. Perfect for revisiting valuable content later.",
    icon: <Bookmark className="w-6 h-6" />,
    position: "center",
    route: "/saved"
  },
  {
    id: "explore-page",
    title: "Explore & Search",
    description: "Discover new influencers and search for specific ones. Add your favorite creators to follow.",
    icon: <Search className="w-6 h-6" />,
    position: "center",
    route: "/explore"
  },
  {
    id: "add-influencer",
    title: "Add New Influencers",
    description: "Can't find an influencer? Add them by submitting their YouTube URL and expand your feed.",
    icon: <Plus className="w-6 h-6" />,
    position: "top"
  },
  {
    id: "profile-settings",
    title: "Profile & Preferences",
    description: "Customize your interests, manage account settings, and personalize your ByteMe experience.",
    icon: <User className="w-6 h-6" />,
    position: "center",
    route: "/profile"
  },
  {
    id: "categories",
    title: "Interest Categories",
    description: "Select AI categories you're interested in to get more relevant content in your feed.",
    icon: <User className="w-6 h-6" />,
    position: "bottom"
  }
];

const AppTutorial = ({ onComplete, onSkip }: AppTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const currentTutorialStep = tutorialSteps[currentStep];

  useEffect(() => {
    // Find and highlight the target element
    if (currentTutorialStep.highlightSelector) {
      const element = document.querySelector(currentTutorialStep.highlightSelector) as HTMLElement;
      setHighlightedElement(element);
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, currentTutorialStep.highlightSelector]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Create spotlight overlay
  const createSpotlight = () => {
    if (!highlightedElement) return null;

    const rect = highlightedElement.getBoundingClientRect();
    const spotlightStyle = {
      position: 'absolute' as const,
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
      borderRadius: '12px',
      boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.75)',
      pointerEvents: 'none' as const,
      zIndex: 60,
    };

    return <div style={spotlightStyle} />;
  };

  const getModalPosition = () => {
    if (!highlightedElement || currentTutorialStep.position === "center") {
      return "fixed inset-0 flex items-center justify-center";
    }

    const rect = highlightedElement.getBoundingClientRect();
    const modalHeight = 320; // Approximate modal height
    const spacing = 20;

    if (currentTutorialStep.position === "top" && rect.top > modalHeight + spacing) {
      return `fixed flex items-end justify-center`;
    } else if (currentTutorialStep.position === "bottom" && window.innerHeight - rect.bottom > modalHeight + spacing) {
      return `fixed flex items-start justify-center`;
    }

    return "fixed inset-0 flex items-center justify-center";
  };

  const getModalStyle = () => {
    if (!highlightedElement || currentTutorialStep.position === "center") {
      return {};
    }

    const rect = highlightedElement.getBoundingClientRect();
    const modalHeight = 320;
    const spacing = 20;

    if (currentTutorialStep.position === "top" && rect.top > modalHeight + spacing) {
      return {
        bottom: window.innerHeight - rect.top + spacing,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    } else if (currentTutorialStep.position === "bottom" && window.innerHeight - rect.bottom > modalHeight + spacing) {
      return {
        top: rect.bottom + spacing,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    return {};
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/75" />
      
      {/* Spotlight overlay */}
      {createSpotlight()}

      {/* Tutorial Modal */}
      <div className={cn("z-[70] p-4", getModalPosition())} style={getModalStyle()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-background rounded-xl max-w-md w-full p-6 shadow-2xl border"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {currentTutorialStep.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{currentTutorialStep.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-muted-foreground leading-relaxed">
              {currentTutorialStep.description}
            </p>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentStep ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onSkip}>
                Skip Tour
              </Button>
              <Button onClick={nextStep} className="flex items-center gap-2">
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                {currentStep !== tutorialSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AppTutorial;