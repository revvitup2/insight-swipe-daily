

"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import Navigation from "@/components/Navigation";
import FeedbackForm from "@/components/FeedbackForm";
import UserUpload from "@/components/UserUpload";
import { cn } from "@/lib/utils";

const industries = [
  { id: "finance", name: "Finance", selected: true },
  { id: "ai", name: "Artificial Intelligence", selected: true },
  { id: "healthcare", name: "Healthcare", selected: false },
  { id: "startups", name: "Startups", selected: true },
  { id: "business", name: "Business", selected: true },
  { id: "technology", name: "Technology", selected: false },
  { id: "marketing", name: "Marketing", selected: false },
  { id: "design", name: "Design", selected: false },
  { id: "others", name: "Others", selected: false },
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
  const [myUploads, setMyUploads] = useState<any[]>(() => {
    const stored = localStorage.getItem("myUploads");
    return stored ? JSON.parse(stored) : [];
  });
  
  const navigate = useNavigate();
  
  const { isDarkMode, toggleDarkMode } = useTheme();
  
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

  const handleUploadComplete = (content: any) => {
    const updatedUploads = [...myUploads, content];
    setMyUploads(updatedUploads);
    localStorage.setItem("myUploads", JSON.stringify(updatedUploads));
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
        
        <Tabs defaultValue="settings" className="w-full">
          
          <TabsContent value="settings" className="space-y-8">
      
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Interests</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select categories to personalize your feed
              </p>
              
              <div className="grid grid-cols-1 gap-2 mb-4">
                {userIndustries.map(industry => (
                  <div 
                      key={industry.id}
  className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
    industry.selected 
      ? 'border-primary bg-primary/10 dark:bg-primary/20' 
      : 'border-border bg-card hover:bg-accent'
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
            <div className="space-y-4">
  {Object.entries(notifications).map(([key, value]) => (
    <div 
      key={key} 
      className="flex items-center justify-between p-4 rounded-lg bg-card"
    >
      <div>
        <Label htmlFor={key} className="block font-medium">
          {key
    .split(/(?=[A-Z])/)         // Split camelCase: 'dailyDigest' → ['daily', 'Digest']
    .join(' ')                  // Join with space: ['daily', 'Digest'] → 'daily Digest'
    .replace(/^\w/, c => c.toUpperCase())}
        </Label>
        <p className="text-xs text-muted-foreground">
          {key === 'dailyDigest' && 'Receive a daily summary of top Bytes'}
          {key === 'newBytes' && 'Get notified when new Bytes are available'}
          {key === 'influencerUpdates' && 'Notifications about influencers you follow'}
        </p>
      </div>
      <Switch
        id={key}
        checked={value}
        onCheckedChange={() => handleNotificationChange(key as keyof typeof notifications)}
      />
    </div>
  ))}
</div>
            </section>
            <section className="mb-8 p-4 rounded-lg bg-card border border-border">
  <h2 className="text-xl font-semibold mb-4">Appearance</h2>
  <div className="flex items-center justify-between p-4 rounded-lg bg-background">
    <div>
      <Label htmlFor="darkMode" className="block font-medium">
        Dark Mode
      </Label>
      <p className="text-xs text-muted-foreground">
        Switch between light and dark themes
      </p>
    </div>
    <Switch
      id="darkMode"
      checked={isDarkMode}
      onCheckedChange={toggleDarkMode}
      className="data-[state=checked]:bg-primary"
    />
  </div>
</section>
         <section className="mb-8 p-4 rounded-lg bg-card border border-border">
  <h2 className="text-xl font-semibold mb-4">Account</h2>
  
  <Button 
    variant="outline" 
    className={cn(
      "w-full",
      "text-destructive hover:text-destructive",
      "border-destructive/20 hover:border-destructive/40",
      "hover:bg-destructive/10 dark:hover:bg-destructive/20",
      "dark:border-destructive/30 dark:hover:border-destructive/50"
    )}
    onClick={handleLogout}
  >
    Reset App
  </Button>
</section>


            <section className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <FeedbackForm onSubmit={handleFeedbackSubmit} />
            </section>
          </TabsContent>
          
          <TabsContent value="uploads" className="space-y-4">
            <div className="text-center py-8">
              {myUploads.length === 0 ? (
                <div>
                  <h3 className="text-lg font-semibold mb-2">No uploads yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload content using the + button to see your processed bytes here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Processed Content</h3>
                  {myUploads.map((upload) => (
                    <div key={upload.id} className="p-4 border rounded-lg bg-card">
                      <h4 className="font-medium">{upload.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{upload.summary}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span>Source: {upload.source}</span>
                        <span>{new Date(upload.processedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Profile;

