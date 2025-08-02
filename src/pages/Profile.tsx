import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, LogOut, Settings } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext"; // Update this import
import { getUserPreferences, saveUserPreferences } from "@/lib/api";
import { useAuthActions } from "@/contexts/authUtils";
import { useSelectedIndustries } from "@/contexts/selectedIndustries";
import FeedbackForm from "@/components/FeedbackForm";
import { industries } from "@/components/OnboardingFlow";


const Profile = () => {
  const { user, loading, token } = useAuth(); // Use the auth context
    const { handleGoogleSignIn, handleSignOut } = useAuthActions();
  // const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const loadPreferences = async () => {
  //     if (user && token) {
  //       try {
  //         const preferences = await getUserPreferences(token);
  //         setSelectedIndustries(preferences.selected_categories || []);
  //       } catch (error) {
  //         console.error('Error loading preferences:', error);
  //       }
  //     } else {
  //       const stored = localStorage.getItem("selectedIndustries");
  //       setSelectedIndustries(stored ? JSON.parse(stored) : []);
  //     }
  //   };

  //   loadPreferences();
  // }, [user, token]);
  const { selectedIndustries,savePreferences, setSelectedIndustries,toggleIndustry } = useSelectedIndustries(user, token)

  

  // const toggleIndustry = async (industryId: string) => {
  //   setSelectedIndustries(prev => {
  //     const updated = prev.includes(industryId)
  //       ? prev.filter(id => id !== industryId)
  //       : [...prev, industryId];
      
  //     if (!user) {
  //       localStorage.setItem("selectedIndustries", JSON.stringify(updated));
  //     } else if (token) {
  //       // Save to backend if user is signed in
  //       saveUserPreferences(token, {
  //         selected_categories: updated
  //       }).catch(error => {
  //         console.error('Error saving preferences:', error);
  //         toast({
  //           title: "Error",
  //           description: "Failed to save preferences",
  //           variant: "destructive",
  //         });
  //       });
  //     }
  //     return updated;
  //   });
  // };

  const handleToggle = (industryId: string) => {
  toggleIndustry(industryId);
};
console.log("selectedindusties",selectedIndustries);
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 md:py-12 px-4 pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <Navigation />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 md:py-12 px-4 pb-20 md:pb-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Profile & Settings</h1>
            <p className="text-muted-foreground">Customize your ByteMe experience</p>
          </div>

          {/* User Profile Section */}
          {user ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                
                <div>
                   <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.displayName || "User"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                 
                </div>
                   <Button 
                    variant="outline" 
                    className="ml-auto mt-10 items-center justify-center"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
               
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Sign in to save your preferences across devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleGoogleSignIn}
                  className="w-full bg-primary hover:bg-primary text-white"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path 
                      fill="currentColor" 
                      d="M12 12h5.5v2.5H12V22h-3v-7.5H3.5v-2.5H9V2h3v10z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Interests Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Industry Interests
              </CardTitle>
              <CardDescription>
                Select the industries you're interested in to personalize your feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {industries.map((industry) => (
                  <Badge
                    key={industry.id}
                    variant={selectedIndustries.includes(industry.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 text-sm"
                    onClick={() => handleToggle(industry.id)}
                  >
                    {industry.name}
                  </Badge>
                ))}
              </div>
              {/* <Button onClick={handleSavePreferences} className="w-full">
                Save Preferences
              </Button> */}
            </CardContent>
          </Card>

          {/* Follow Preferences */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Follow Preferences
              </CardTitle>
              <CardDescription>
                Manage the influencers you follow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => navigate("/influencers")}
              >
                <span>Manage Following</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card> */}

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how ByteMe looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

              <FeedbackForm/>
          
          <div className="mt-20"></div>

          {/* App Info */}
          {/* <Card>
            <CardHeader>
              <CardTitle>About ByteMe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span>1.0.0</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span>2024.1</span>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Profile;