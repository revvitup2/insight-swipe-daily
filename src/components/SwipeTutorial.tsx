
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeTutorialProps {
  onComplete: () => void;
}

const SwipeTutorial = ({ onComplete }: SwipeTutorialProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-6 relative">
        <button 
          onClick={onComplete} 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome to ByteMe!</h2>
          <p className="text-muted-foreground">Learn how to navigate through Bytes</p>
        </div>
        
        {step === 1 && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-center border rounded-lg p-6 mb-4 w-full">
              <div className="flex flex-col mb-4 animate-bounce">
                <ChevronUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <ChevronDown className="w-8 h-8 text-primary mx-auto" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Swipe Up & Down</h3>
              <p className="text-center text-sm text-muted-foreground">
                Navigate between Bytes by swiping up for next and down for previous
              </p>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-center border rounded-lg p-6 mb-4 w-full">
              <div className="flex mb-4 animate-pulse">
                <ChevronLeft className="w-8 h-8 text-primary mx-2" />
                <ChevronRight className="w-8 h-8 text-primary mx-2" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Swipe Left & Right</h3>
              <p className="text-center text-sm text-muted-foreground">
                Swipe right to view the source and left to see the influencer profile
              </p>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-center border rounded-lg p-6 mb-4 w-full">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4">
                <span className="text-white font-bold">Tap</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Tap to Interact</h3>
              <p className="text-center text-sm text-muted-foreground">
                Tap the screen to show or hide the navigation bar. Tap on buttons to like, save or share Bytes
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex flex-col">
          <div className="flex justify-center mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full mx-1",
                  i + 1 === step ? "bg-primary" : "bg-gray-300"
                )}
              />
            ))}
          </div>
          
          <Button onClick={nextStep}>
            {step < totalSteps ? "Next" : "Get Started"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwipeTutorial;
