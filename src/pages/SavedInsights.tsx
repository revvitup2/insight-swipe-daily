
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Insight } from "@/components/InsightCard";

const SavedInsights = () => {
  const [savedInsights, setSavedInsights] = useState<Insight[]>([]);
  
  useEffect(() => {
    // In a real app, we would fetch saved insights from an API
    // For now, we'll use local storage to simulate persistence
    const mockSavedInsights = localStorage.getItem("savedInsights");
    if (mockSavedInsights) {
      setSavedInsights(JSON.parse(mockSavedInsights));
    }
  }, []);
  
  const navigate = useNavigate();
  
  const handleInsightClick = (id: string) => {
    // In a real app, navigate to the specific insight
    navigate(`/`);
  };

  return (
    <div className="page-container bg-background">
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-6">Saved Insights</h1>
        
        {savedInsights.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {savedInsights.map(insight => (
              <div 
                key={insight.id} 
                className="border rounded-xl overflow-hidden cursor-pointer animate-card-in"
                onClick={() => handleInsightClick(insight.id)}
              >
                <div className="flex h-32">
                  <div className="w-1/3">
                    <img 
                      src={insight.image}
                      alt={insight.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-3 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium line-clamp-2">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{insight.summary}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <img 
                          src={insight.influencer.profileImage}
                          alt={insight.influencer.name}
                          className="w-5 h-5 rounded-full mr-1"
                        />
                        <span className="text-xs">{insight.influencer.name}</span>
                      </div>
                      <span className="text-xs bg-muted py-0.5 px-1.5 rounded-full">
                        {insight.industry}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-6xl mb-4">📥</div>
            <h3 className="font-semibold text-lg mb-2">No saved insights yet</h3>
            <p className="text-muted-foreground">
              Save interesting insights to read them later
            </p>
          </div>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default SavedInsights;
