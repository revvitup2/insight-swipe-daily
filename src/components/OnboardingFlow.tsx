
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  const toggleIndustry = (industryId: string) => {
    if (selectedIndustries.includes(industryId)) {
      setSelectedIndustries(selectedIndustries.filter(id => id !== industryId));
    } else {
      if (selectedIndustries.length < 5) {
        setSelectedIndustries([...selectedIndustries, industryId]);
      }
    }
  };
  
  const handleComplete = () => {
    onComplete(selectedIndustries);
  };
  
  return (
    <div className="min-h-screen flex flex-col p-6">
      {step === 1 && (
        <div className="flex flex-col items-center justify-center flex-grow animate-fade-in">
          <div className="text-4xl mb-4">VibeOn</div>
          <h1 className="text-2xl font-bold text-center mb-4">
            Daily insights from top influencers you ❤️
          </h1>
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
          <h1 className="text-2xl font-bold mb-2">Select your interests</h1>
          <p className="text-muted-foreground mb-6">Choose 3-5 industries you're interested in</p>
          
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
          
          <Button
            onClick={handleComplete}
            disabled={selectedIndustries.length < 3}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Continue
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Selected {selectedIndustries.length}/5 industries
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingFlow;
