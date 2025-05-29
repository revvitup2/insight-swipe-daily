"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import FeedbackForm from "@/components/FeedbackForm";

const industries = [
  { id: "finance", name: "Finance", selected: true },
  { id: "ai", name: "Artificial Intelligence", selected: true },
  { id: "healthcare", name: "Healthcare", selected: false },
  { id: "startups", name: "Startups", selected: true },
  { id: "business", name: "Business", selected: true },
  { id: "technology", name: "Technology", selected: false },
  { id: "marketing", name: "Marketing", selected: false },
  { id: "design", name: "Design", selected: false },
];

const Profile = () => {
  const [userIndustries, setUserIndustries] = useState(() => {
    const stored = localStorage.getItem("selectedIndustries");
    return stored 
      ? industries.map(i => ({
          id: i.id,
          name: i.name,
          selected: JSON.parse(stored).includes(i.id)
        }))
      : industries.map(i => ({ ...i, selected: false }));
  });
  const [notifications, setNotifications] = useState({
    dailyDigest: true,
    newBytes: true,
    influencerUpdates: false,
  });
  
  const navigate = useNavigate();
  
  const toggleIndustry = (id: string) => {
    setUserIndustries(userIndustries.map(industry => {
      if (industry.id === id) {
        return { ...industry, selected: !industry.selected };
      }
      return industry;
    }));
  };
  
  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
  };
  
  const handleSaveChanges = () => {
    const selected = userIndustries.filter(i => i.selected).map(i => i.id);
    localStorage.setItem("selectedIndustries", JSON.stringify(selected));
    
    toast({
      title: "Settings saved",
      description: "Your profile settings have been updated",
    });
  };

  const handleFeedbackSubmit = (rating: number, feedback: string) => {
    console.log("Feedback submitted:", { rating, feedback });
    // In a real app, this would send to your backend
  };
  
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };
  
  return (
    <div className="page-container bg-background">
      <div className="p-4 pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button 
            onClick={handleSaveChanges}
            className="px-6 py-2 rounded-sm bg-primary hover:bg-primary/90 shadow-sm"
          >
            Save Changes
          </Button>
        </div>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Interests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select categories to personalize your feed
          </p>
          
          <div className="grid grid-cols-1 gap-2 mb-4">
            {userIndustries.map(industry => (
              <div 
                key={industry.id}
                className={`flex items-center justify-between p-3 border rounded-md ${
                  industry.selected ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <span className="font-medium">{industry.name}</span>
                <Button
                  variant={industry.selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleIndustry(industry.id)}
                  className="text-xs"
                >
                  {industry.selected ? "Selected" : "Add"}
                </Button>
              </div>
            ))}
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dailyDigest" className="block font-medium">
                  Daily Digest
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive a daily summary of top Bytes
                </p>
              </div>
              <Switch
                id="dailyDigest"
                checked={notifications.dailyDigest}
                onCheckedChange={() => handleNotificationChange('dailyDigest')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newBytes" className="block font-medium">
                  New Bytes
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when new Bytes are available
                </p>
              </div>
              <Switch
                id="newBytes"
                checked={notifications.newBytes}
                onCheckedChange={() => handleNotificationChange('newBytes')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="influencerUpdates" className="block font-medium">
                  Influencer Updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Notifications about influencers you follow
                </p>
              </div>
              <Switch
                id="influencerUpdates"
                checked={notifications.influencerUpdates}
                onCheckedChange={() => handleNotificationChange('influencerUpdates')}
              />
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          
          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            Reset App
          </Button>
        </section>

        <section className="mb-8 p-4 border rounded-lg bg-gray-50">
          <FeedbackForm onSubmit={handleFeedbackSubmit} />
        </section>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Profile;