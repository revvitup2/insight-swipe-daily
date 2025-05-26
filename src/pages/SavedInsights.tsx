// pages/SavedBytes.tsx
"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Insight } from "@/components/InsightCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { SavedInsightCard } from "@/components/SavedInsightsCard";
import { SavedBytesData, VersionedInsight } from "./Index";
import { CURRENT_INSIGHT_VERSION } from "@/constants/constants";

const SavedBytes = () => {
  const [savedBytes, setSavedBytes] = useState<Insight[]>([]);
  const navigate = useNavigate();
  
    useEffect(() => {
    const loadSavedBytes = () => {
      try {
        const saved = localStorage.getItem("savedBytes");
        if (saved) {
          const parsed: SavedBytesData = JSON.parse(saved);
          // Get only current version Bytes
          const currentVersionBytes = parsed.versions?.[CURRENT_INSIGHT_VERSION] || [];
          
          // Ensure we have valid Bytes with all required fields
          const validBytes = currentVersionBytes.filter((insight: Insight) => 
            insight?.id && insight?.title && insight?.summary
          );
          setSavedBytes(validBytes);
        }
      } catch (error) {
        console.error("Error loading saved Bytes:", error);
      }
    };

    loadSavedBytes();
    window.addEventListener('storage', loadSavedBytes);
    return () => window.removeEventListener('storage', loadSavedBytes);
  }, []);

   const handleRemoveInsight = (id: string) => {
    const saved = localStorage.getItem("savedBytes");
    if (!saved) return;
    
    const parsed: SavedBytesData = JSON.parse(saved);
    if (!parsed.versions[CURRENT_INSIGHT_VERSION]) return;
    
    // Remove from current version
    parsed.versions[CURRENT_INSIGHT_VERSION] = 
      parsed.versions[CURRENT_INSIGHT_VERSION].filter(i => i.id !== id);
    
    // Update storage
    localStorage.setItem("savedBytes", JSON.stringify(parsed));
    setSavedBytes(prev => prev.filter(i => i.id !== id));
    
    // Update main Bytes
    const allBytes = localStorage.getItem("Bytes");
    if (allBytes) {
      const parsedBytes = JSON.parse(allBytes);
       const updatedBytes = parsedBytes.map((insight: Insight) => 
        insight.id === id ? { ...insight, isSaved: false } : insight
      );
      localStorage.setItem("Bytes", JSON.stringify(updatedBytes));
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
          <h1 className="text-2xl font-bold">Saved Bytes</h1>
          {savedBytes.length > 0 && (
            <div className="flex items-center gap-4">
              {/* <span className="text-sm text-muted-foreground">
                {savedBytes.length} {savedBytes.length === 1 ? "item" : "items"}
              </span> */}
        
            </div>
          )}
        </div>
        
        {savedBytes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedBytes.map(insight => (
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
            <h3 className="text-xl font-semibold mb-2">Your saved Bytes will appear here</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              When you save interesting Bytes, they'll be collected here for easy access later.
            </p>
            <Button onClick={() => navigate("/")}>
              Browse Bytes
            </Button>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default SavedBytes;