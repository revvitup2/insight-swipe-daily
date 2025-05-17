
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ByteMeLogo from "@/components/ByteMeLogo";
import { APP_NAME } from "@/constants/constants";

interface Industry {
  id: string;
  name: string;
  icon: string;
}

const industries: Industry[] = [
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "ai", name: "Artificial Intelligence", icon: "🤖" },
  { id: "healthcare", name: "Healthcare", icon: "🏥" },
  { id: "startups", name: "Startups", icon: "🚀" },
  { id: "business", name: "Business", icon: "💼" },
  { id: "technology", name: "Technology", icon: "💻" },
  { id: "marketing", name: "Marketing", icon: "📢" },
  { id: "design", name: "Design", icon: "🎨" },
];

interface OnboardingFlowProps {
  onComplete: (selectedIndustries: string[]) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [showSelectionWarning, setShowSelectionWarning] = useState(false);
  
  const toggleIndustry = (industryId: string) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter(id => id !== industryId));
      setShowSelectionWarning(false);
    } else {
      if (selectedIndustries.length < 5) {
        setSelectedIndustries([...selectedIndustries, industryId]);
        setShowSelectionWarning(false);
      }
    }
  };
  
  const handleNextStep = () => {
    if (selectedIndustries.length < 3) {
      setShowSelectionWarning(true);
      return;
    }
    handleComplete();
  };
  
  const handleComplete = () => {
    localStorage.setItem("selectedIndustries", JSON.stringify(selectedIndustries));
    onComplete(selectedIndustries);
  };
  
  return (
    <div className="min-h-screen flex flex-col p-6">
      {step === 1 && (
        <div className="flex flex-col items-center justify-center flex-grow animate-fade-in">
          {/* Redesigned branding with more prominent logo */}
          <div className="mb-6 flex flex-col items-center">
            <ByteMeLogo size="lg" className="mb-4" />
            <h1 className="text-3xl font-bold text-primary">{APP_NAME}</h1>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-4">
            Daily insights from top influencers you ❤️
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Top 10 insights. Trusted experts. Delivered daily
          </p>
          <Button 
            onClick={() => setStep(2)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      )}
      
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Select your interests</h1>
              <div className="flex items-center">
                <p className="text-muted-foreground">
                  Choose 3-5 industries you're interested in
                </p>
                {showSelectionWarning && (
                  <div className="ml-2 text-red-500 flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Select at least 3
                  </div>
                )}
              </div>
            </div>
            {/* Add logo to step 2 as well */}
            <ByteMeLogo size="md" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-8">
            {industries.map((industry) => (
              <div
                key={industry.id}
                onClick={() => toggleIndustry(industry.id)}
                className={cn(
                  "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                  selectedIndustries.includes(industry.id)
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <div className="text-2xl mr-3">{industry.icon}</div>
                <div>
                  <div className="font-medium">{industry.name}</div>
                </div>
                {selectedIndustries.includes(industry.id) && (
                  <div className="ml-auto">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={handleNextStep}
              disabled={selectedIndustries.length < 3}
              className={cn(
                "w-full",
                selectedIndustries.length < 3 ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
              )}
            >
              Continue
            </Button>
            
            <div className="flex items-center justify-center">
              <div className="bg-gray-200 h-2 rounded-full flex-1 overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-primary transition-all duration-300",
                    selectedIndustries.length < 3 ? "w-1/3" : 
                    selectedIndustries.length < 5 ? "w-2/3" : "w-full"
                  )}
                ></div>
              </div>
              <p className="ml-2 text-xs text-muted-foreground">
                Selected {selectedIndustries.length}/5
                <span className="text-xs ml-1">
                  (min 3)
                </span>
              </p>
            </div>
            
            {showSelectionWarning && (
              <p className="text-center text-red-500 text-sm">
                Please select at least 3 categories to continue
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
