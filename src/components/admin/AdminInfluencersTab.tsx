
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Loader2 } from "lucide-react";

interface InfluencerSubmission {
  platform: string;
  url: string;
}

export const AdminInfluencersTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState<string>("youtube");
  const [profileUrl, setProfileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentAdditions, setRecentAdditions] = useState<InfluencerSubmission[]>([]);
  
  const handleAddInfluencer = () => {
    if (!profileUrl) {
      toast({
        title: "Missing profile URL",
        description: "Please enter a profile URL",
        variant: "destructive"
      });
      return;
    }
    
    // Validate URL format based on platform
    if (platform === "youtube" && !profileUrl.includes("youtube.com") && !profileUrl.includes("youtu.be")) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube channel or video URL",
        variant: "destructive"
      });
      return;
    }
    
    if (platform === "twitter" && !profileUrl.includes("twitter.com") && !profileUrl.includes("x.com")) {
      toast({
        title: "Invalid Twitter URL",
        description: "Please enter a valid Twitter profile URL",
        variant: "destructive"
      });
      return;
    }
    
    if (platform === "linkedin" && !profileUrl.includes("linkedin.com")) {
      toast({
        title: "Invalid LinkedIn URL",
        description: "Please enter a valid LinkedIn profile URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Influencer added",
        description: "The influencer has been added for content processing",
      });
      
      setRecentAdditions([
        { platform, url: profileUrl },
        ...recentAdditions
      ]);
      
      setProfileUrl("");
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Influencer</CardTitle>
          <CardDescription>
            Add influencers by entering their social media profile URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Profile URL</label>
              <Input
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                placeholder="https://youtube.com/channel/..."
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleAddInfluencer} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Influencer...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Influencer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Additions</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search additions..."
              className="pl-10 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {recentAdditions.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">
              No influencers have been added yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAdditions
              .filter(item => item.url.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium mb-1">
                          {item.platform === "youtube" 
                            ? "YouTube Channel" 
                            : item.platform === "twitter"
                              ? "Twitter Profile"
                              : "LinkedIn Profile"}
                        </div>
                        <div className="text-sm text-muted-foreground break-all">
                          {item.url}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.platform === "youtube" 
                          ? "bg-red-100 text-red-800" 
                          : item.platform === "twitter"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-blue-100 text-blue-800"
                      }`}>
                        {item.platform}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
