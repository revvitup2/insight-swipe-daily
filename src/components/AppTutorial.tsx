import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
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
  selector: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "trending-tab",
    title: "Trending Feed",
    description: "Discover the most popular AI insights trending right now. This shows content from all influencers.",
    selector: "[data-tab='trending']",
    position: "bottom"
  },
  {
    id: "following-tab", 
    title: "Following Feed",
    description: "View insights only from influencers you follow. Your personalized content feed.",
    selector: "[data-tab='following']",
    position: "bottom"
  },
  {
    id: "insight-card",
    title: "Swipe Navigation",
    description: "Swipe up/down to navigate between insights. Swipe left to see influencer profile, right to view source.",
    selector: ".swipe-container",
    position: "center"
  },
  {
    id: "saved-nav",
    title: "Saved Insights",
    description: "Access all your saved insights here. Perfect for revisiting valuable content later.",
    selector: "[data-nav='saved']",
    position: "top"
  },
  {
    id: "explore-nav",
    title: "Explore & Search",
    description: "Discover new influencers and search for specific ones. Add your favorite creators to follow.",
    selector: "[data-nav='explore']",
    position: "top"
  },
  {
    id: "profile-nav",
    title: "Profile & Settings",
    description: "Customize your interests, manage account settings, and personalize your ByteMe experience.",
    selector: "[data-nav='profile']",
    position: "top"
  }
];

const AppTutorial = ({ onComplete, onSkip }: AppTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentTutorialStep = tutorialSteps[currentStep];

  useEffect(() => {
    const findAndHighlightElement = () => {
      const element = document.querySelector(currentTutorialStep.selector) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
      } else {
        // Retry finding element after a short delay
        setTimeout(findAndHighlightElement, 100);
      }
    };

    findAndHighlightElement();
  }, [currentStep, currentTutorialStep.selector]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipTutorial = () => {
    onSkip();
  };

  const getFloatingTextPosition = () => {
    if (!elementRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const padding = 20;
    const textBoxHeight = 120; // Approximate height of text box
    const textBoxWidth = 300; // Approximate width of text box

    let position: any = {};

    switch (currentTutorialStep.position) {
      case "top":
        position = {
          top: elementRect.top - textBoxHeight - padding,
          left: elementRect.left + elementRect.width / 2,
          transform: "translateX(-50%)"
        };
        break;
      case "bottom":
        position = {
          top: elementRect.bottom + padding,
          left: elementRect.left + elementRect.width / 2,
          transform: "translateX(-50%)"
        };
        break;
      case "left":
        position = {
          top: elementRect.top + elementRect.height / 2,
          left: elementRect.left - textBoxWidth - padding,
          transform: "translateY(-50%)"
        };
        break;
      case "right":
        position = {
          top: elementRect.top + elementRect.height / 2,
          left: elementRect.right + padding,
          transform: "translateY(-50%)"
        };
        break;
      case "center":
      default:
        position = {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        };
        break;
    }

    // Ensure text stays within viewport
    if (position.top < 0) position.top = padding;
    if (position.left < 0) position.left = padding;

    return position;
  };

  const createSpotlightMask = () => {
    if (!elementRect) return "";

    const spotlightRadius = 8; // Border radius for the spotlight
    const padding = 8; // Extra padding around the element
    
    const x = elementRect.left - padding;
    const y = elementRect.top - padding;
    const width = elementRect.width + (padding * 2);
    const height = elementRect.height + (padding * 2);

    return `
      polygon(
        0% 0%, 
        0% 100%, 
        ${x}px 100%, 
        ${x}px ${y}px, 
        ${x + width}px ${y}px, 
        ${x + width}px ${y + height}px, 
        ${x}px ${y + height}px, 
        ${x}px 100%, 
        100% 100%, 
        100% 0%
      )
    `;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Darkened overlay with spotlight cutout */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/75 transition-all duration-300"
        style={{
          clipPath: elementRect ? createSpotlightMask() : "none"
        }}
      />

      {/* Highlight border around element */}
      {elementRect && (
        <div
          className="absolute border-2 border-primary rounded-lg transition-all duration-300"
          style={{
            top: elementRect.top - 8,
            left: elementRect.left - 8,
            width: elementRect.width + 16,
            height: elementRect.height + 16,
            pointerEvents: "none"
          }}
        />
      )}

      {/* Floating text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute bg-background rounded-xl p-6 shadow-2xl border max-w-sm"
          style={getFloatingTextPosition()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg text-foreground">{currentTutorialStep.title}</h3>
            <Button variant="ghost" size="sm" onClick={skipTutorial}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {currentTutorialStep.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center mb-4">
            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentStep ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={skipTutorial}>
                Skip
              </Button>
              <Button size="sm" onClick={nextStep} className="flex items-center gap-2">
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                {currentStep !== tutorialSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Pointer arrow based on position */}
          {currentTutorialStep.position === "top" && (
            <ChevronDown className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-background drop-shadow-lg" />
          )}
          {currentTutorialStep.position === "bottom" && (
            <ChevronUp className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 text-background drop-shadow-lg" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Welcome step - center modal */}
      {currentStep === -1 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-xl p-8 shadow-2xl border max-w-md mx-4"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">Welcome to ByteMe!</h2>
              <p className="text-muted-foreground mb-6">
                Let's take a quick tour to help you get the most out of your AI insights experience.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={skipTutorial}>
                  Skip Tour
                </Button>
                <Button onClick={() => setCurrentStep(0)}>
                  Start Tour
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppTutorial;