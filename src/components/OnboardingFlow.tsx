
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ByteMeLogo from "@/components/ByteMeLogo";
import { APP_NAME } from "@/constants/constants";
import { useSelectedIndustries } from "@/contexts/selectedIndustries";
import { useAuth } from "@/contexts/AuthContext";

interface Industry {
  id: string;
  name: string;
}

export const industries: Industry[] = [
    {id: "ai-tools-apps", name: "AI Tools & Apps"},
        {id: "chatgpt-friends", name: "ChatGPT & Friends"},
        {id: "ai-in-business", name: "AI in Business"},
        {id: "creative-ai", name: "Creative AI"},
        {id: "ai-search-browsing", name: "AI Search & Browsing"},
        {id: "new-ai-breakthroughs", name: "New AI Breakthroughs"},
        {id: "ai-hardware-chips", name: "AI Hardware & Chips"},
        {id: "rules-ethics", name: "Rules & Ethics"},
        {id: "jobs-society", name: "Jobs & Society"},
        {id: "ai-startups-funding", name: "AI Startups & Funding"},
];

interface OnboardingFlowProps {
  onComplete: (selectedIndustries: string[]) => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { user, loading, token } = useAuth();
  // const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const { selectedIndustries, toggleIndustry, setSelectedIndustries } = useSelectedIndustries(user, token);

  const [step, setStep] = useState(1);
  const [showSelectionWarning, setShowSelectionWarning] = useState(false);
  
  // const toggleIndustry = (industryId: string) => {
  //   if (selectedIndustries.includes(industryId)) {
  //     setSelectedIndustries(selectedIndustries.filter(id => id !== industryId));
  //   } else {
  //     setSelectedIndustries([...selectedIndustries, industryId]);
  //   }
  //   setShowSelectionWarning(false);
  // };

  const selectAllIndustries = () => {
    setSelectedIndustries(industries.map(industry => industry.id));
    setShowSelectionWarning(false);
  };

  const deselectAllIndustries = () => {
    setSelectedIndustries([]);
       localStorage.setItem("selectedIndustries", JSON.stringify([]));
  };
  
  const handleNextStep = () => {
    if (selectedIndustries.length < 1) {
      setShowSelectionWarning(true);
      return;
    }
    handleComplete();
  };
  
  const handleComplete = () => {
    onComplete(selectedIndustries);
  };
  
  return (
    <div className="min-h-screen flex flex-col p-6">
      {step === 1 && (
        <div className="flex flex-col items-center justify-center flex-grow animate-fade-in">
          <div className="mb-6 flex flex-col items-center">
            <ByteMeLogo size="lg" className="mb-4" />
            <h1 className="text-3xl font-bold text-primary">{APP_NAME}</h1>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-4">
            Daily Bytes from top influencers you ❤️
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Top 10 Bytes. Trusted experts. Delivered daily
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
                  Choose categories you're interested in
                </p>
                {showSelectionWarning && (
                  <div className="ml-2 text-red-500 flex items-center text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Select at least 1
                  </div>
                )}
              </div>
            </div>
            <ByteMeLogo size="md" />
          </div>

          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllIndustries}
              className="text-xs"
            >
              Select All
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={deselectAllIndustries}
              className="text-xs"
            >
              Deselect All
            </Button> */}
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
                {/* <div className="text-2xl mr-3">{industry.icon}</div> */}
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
              disabled={selectedIndustries.length < 1}
              className={cn(
                "w-full",
                selectedIndustries.length < 1 ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
              )}
            >
              Continue
            </Button>
            
            {/* <div className="flex items-center justify-center">
              <p className="text-xs text-muted-foreground">
                Selected {selectedIndustries.length}/{industries.length}
              </p>
            </div> */}
            
            {showSelectionWarning && (
              <p className="text-center text-red-500 text-sm">
                Please select at least 1 category to continue
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;