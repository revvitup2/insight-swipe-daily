// pages/SavedInsights.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Insight } from "@/components/InsightCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { SavedInsightCard } from "@/components/SavedInsightsCard";

const SavedInsights = () => {
  const [savedInsights, setSavedInsights] = useState<Insight[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSavedInsights = () => {
      try {
        const saved = localStorage.getItem("savedInsights");
        if (saved) {
          const parsed = JSON.parse(saved);
          // Ensure we have valid insights with all required fields
          const validInsights = parsed.filter((insight: Insight) => 
            insight?.id && insight?.title && insight?.summary
          );
          setSavedInsights(validInsights);
        }
      } catch (error) {
        console.error("Error loading saved insights:", error);
      }
    };

    loadSavedInsights();
    window.addEventListener('storage', loadSavedInsights);
    return () => window.removeEventListener('storage', loadSavedInsights);
  }, []);

  const handleRemoveInsight = (id: string) => {
    const updated = savedInsights.filter(insight => insight.id !== id);
    setSavedInsights(updated);
    localStorage.setItem("savedInsights", JSON.stringify(updated));
    
    // Update main insights if they exist in localStorage
    const allInsights = localStorage.getItem("insights");
    if (allInsights) {
      const parsed = JSON.parse(allInsights);
      const updatedAllInsights = parsed.map((insight: Insight) => 
        insight.id === id ? { ...insight, isSaved: false } : insight
      );
      localStorage.setItem("insights", JSON.stringify(updatedAllInsights));
    }

    toast({
      title: "Removed from saved",
      description: "This insight has been removed from your collection",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Saved Insights</h1>
          {savedInsights.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {savedInsights.length} {savedInsights.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
        
        {savedInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedInsights.map(insight => (
              <SavedInsightCard
                key={insight.id}
                insight={insight}
                onRemove={handleRemoveInsight}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Your saved insights will appear here</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              When you save interesting insights, they'll be collected here for easy access later.
            </p>
            <Button onClick={() => navigate("/")}>
              Browse Insights
            </Button>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default SavedInsights;