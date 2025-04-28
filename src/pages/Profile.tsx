
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

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
  const [userIndustries, setUserIndustries] = useState(industries);
  const [notifications, setNotifications] = useState({
    dailyDigest: true,
    newInsights: true,
    influencerUpdates: false,
  });
  
  const navigate = useNavigate();
  
  const toggleIndustry = (id: string) => {
    const selected = userIndustries.filter(i => i.selected).length;
    
    setUserIndustries(userIndustries.map(industry => {
      if (industry.id === id) {
        // If currently selected and trying to deselect
        if (industry.selected && selected <= 3) {
          toast({
            title: "Minimum 3 interests required",
            description: "Please select at least 3 industries",
            variant: "destructive"
          });
          return industry;
        }
        
        // If not selected and trying to select but already have 5
        if (!industry.selected && selected >= 5) {
          toast({
            title: "Maximum 5 interests allowed",
            description: "Please remove an industry before adding another",
            variant: "destructive"
          });
          return industry;
        }
        
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
    toast({
      title: "Settings saved",
      description: "Your profile settings have been updated",
    });
  };
  
  const handleLogout = () => {
    // In a real app, we would log out the user
    localStorage.removeItem("onboarded");
    navigate("/");
    window.location.reload();
  };
  
  return (
    <div className="page-container bg-background">
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Interests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Select 3-5 industries to personalize your feed
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
                  Receive a daily summary of top insights
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
                <Label htmlFor="newInsights" className="block font-medium">
                  New Insights
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when new insights are available
                </p>
              </div>
              <Switch
                id="newInsights"
                checked={notifications.newInsights}
                onCheckedChange={() => handleNotificationChange('newInsights')}
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
            className="w-full mb-2"
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            Reset App
          </Button>
        </section>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Profile;
