
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { SavedInsightCard } from "@/components/SavedInsightsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface SavedInsight {
  id: string;
  title: string;
  summary: string;
  image: string;
  industry: string;
  publishedAt: string;
}

const industries = [
  "Finance",
  "AI",
  "Healthcare",
  "Startups",
  "Business",
  "Technology",
  "Marketing",
  "Design",
  "Others",
];

const Explore = () => {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem("savedBytes");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Access the insights from the latest version
        const latestVersion = Object.keys(parsedData.versions).pop();
        const insights = parsedData.versions[latestVersion] || [];
        setSavedInsights(insights);
      } catch (error) {
        console.error("Error parsing savedBytes from localStorage:", error);
        toast({
          title: "Error",
          description: "Failed to load saved insights.",
          variant: "destructive",
        });
      }
    }
  }, []);

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((item) => item !== industry)
        : [...prev, industry]
    );
  };

  const filteredInsights = savedInsights.filter((insight) => {
    if (selectedIndustries.length === 0) {
      return true;
    }
    return selectedIndustries.some((industry) =>
      insight.industry.toLowerCase().includes(industry.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-primary">Explore Bytes</h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Filter by Industry</h2>
          <div className="flex flex-wrap gap-2">
            {industries.map((industry) => (
              <Button
                key={industry}
                variant="outline"
                className={selectedIndustries.includes(industry) ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}
                onClick={() => toggleIndustry(industry)}
              >
                {industry}
                {selectedIndustries.includes(industry) && (
                  <Badge className="ml-2">
                    {filteredInsights.filter((insight) =>
                      insight.industry.toLowerCase().includes(industry.toLowerCase())
                    ).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">
            {filteredInsights.length > 0 ? "Filtered Bytes" : "All Bytes"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.length > 0 ? (
              filteredInsights.map((insight) => (
                <SavedInsightCard
                  key={insight.id}
                  insight={insight}
                  onClick={() => navigate(`/bytes/${insight.id}`)}
                />
              ))
            ) : (
              savedInsights.map((insight) => (
                <SavedInsightCard
                  key={insight.id}
                  insight={insight}
                  onClick={() => navigate(`/bytes/${insight.id}`)}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Explore;
