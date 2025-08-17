import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createInfluencer, fetchInfluencers, updateInfluencerPause } from "@/lib/api";
import { searchYouTubeChannels, addPersonalizedChannel } from "@/lib/api/youtube";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { industries } from "../OnboardingFlow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";

interface Influencer {
  _id: string;
  channel_id: string;
  platform: string;
  industry: string;
  industry_type: string;
  username: string | null;
  display_name: string | null;
  profile_picture: string | null;
  last_analyzed: string;
  created_at: string;
  updated_at: string;
  subscribers: number;
  is_pause: boolean;
}

interface YouTubeChannel {
  channel_id: string;
  display_name: string;
  profile_picture: string;
  subscribers: number;
}

const INDUSTRY_TYPE_OPTIONS = [
 "AI"
];

export const AdminInfluencersTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState<string>("youtube");
  const [industry, setIndustry] = useState(industries[0].id);
  const [industryType, setIndustryType] = useState(INDUSTRY_TYPE_OPTIONS[0]); 
  const [channelId, setChannelId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteInfluencerId, setDeleteInfluencerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  
  // Channel search states
  const [youtubeSearchTerm, setYoutubeSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeChannel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<YouTubeChannel | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [urlError, setUrlError] = useState("");

  // Get token once and use it throughout
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    setToken(adminToken);
  }, []);

  useEffect(() => {
    const loadInfluencers = async () => {
      if (!token) return;
      
      try {
        const data = await fetchInfluencers(token);
        setInfluencers(data);
      } catch (error) {
        console.error("Error loading influencers:", error);
        toast({
          title: "Error",
          description: "Failed to load influencers",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInfluencers();
  }, [token]);

  // Debounced YouTube search effect
  useEffect(() => {
    if (!token) return;

    const delayDebounceFn = setTimeout(async () => {
      if (youtubeSearchTerm.length >= 3) {
        try {
          setIsSearching(true);
          setUrlError("");
          const results = await searchYouTubeChannels(youtubeSearchTerm, 5, token);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching YouTube channels:", error);
          setUrlError("Failed to search YouTube channels");
          toast({
            title: "Error",
            description: "Failed to search YouTube channels",
            variant: "destructive",
          });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(delayDebounceFn);
  }, [youtubeSearchTerm, token]);

  const handleChannelSelect = (channel: YouTubeChannel) => {
    setSelectedChannel(channel);
    setChannelId(channel.channel_id);
    setYoutubeSearchTerm(channel.display_name); // Show selected channel name in input
    setSearchResults([]); // Hide search results
    setShowConfirmation(true);
  };

  const handleAddChannelConfirm = async () => {
    if (!selectedChannel) return;

    setShowConfirmation(false);
    setSelectedChannel(null);
    // Keep the selected channel name in the input
    setSearchResults([]);
  };

  const clearChannelSelection = () => {
    setChannelId("");
    setYoutubeSearchTerm("");
    setSelectedChannel(null);
    setSearchResults([]);
    setUrlError("");
  };

  const validateForm = () => {
    if (!platform) {
      toast({
        title: "Platform is required",
        description: "Please select a platform",
        variant: "destructive"
      });
      return false;
    }
    
    if (!channelId) {
      toast({
        title: "Channel ID is required",
        description: "Please enter a channel ID",
        variant: "destructive"
      });
      return false;
    }
    
    if (!industry) {
      toast({
        title: "Industry is required",
        description: "Please select an industry",
        variant: "destructive"
      });
      return false;
    }

    if (!industryType) {
      toast({
        title: "Industry type is required",
        description: "Please select an industry type",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleAddInfluencer = async () => {
    if (!validateForm() || !token) return;

    setIsSubmitting(true);
    
    try {
      await createInfluencer(token, {
        channel_id: channelId,
        industry,
        industry_type: industryType,
        platform
      });
      
      toast({
        title: "Influencer added",
        description: "The influencer has been added for content processing",
      });
      
      // Refresh the list
      const data = await fetchInfluencers(token);
      setInfluencers(data);
      
      // Reset form
      setPlatform("youtube");
      setChannelId("");
      setIndustry(industries[0].id);
      setIndustryType(INDUSTRY_TYPE_OPTIONS[0]);
      clearChannelSelection();

    } catch (error) {
      console.error("Error adding influencer:", error);
      toast({
        title: "Error",
        description: "Failed to add influencer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePause = async (influencerId: string, isPause: boolean) => {
    if (!token) return;

    try {
      await updateInfluencerPause(token, influencerId, isPause);
      
      // Update local state
      setInfluencers(influencers.map(influencer => 
        influencer._id === influencerId 
          ? { ...influencer, is_pause: isPause } 
          : influencer
      ));
      
      toast({
        title: "Status updated",
        description: `Influencer has been ${isPause ? "paused" : "resumed"}`,
      });
    } catch (error) {
      console.error("Error updating influencer pause status:", error);
      toast({
        title: "Error",
        description: "Failed to update influencer status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (influencerId: string) => {
    setDeleteInfluencerId(influencerId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteInfluencerId || !token) return;

    try {
      // Call delete API here (you'll need to add this to your api.ts)
      // await deleteInfluencer(token, deleteInfluencerId);
      
      toast({
        title: "Influencer deleted",
        description: "The influencer has been removed",
      });
      
      // Refresh the list
      const data = await fetchInfluencers(token);
      setInfluencers(data);
    } catch (error) {
      console.error("Error deleting influencer:", error);
      toast({
        title: "Error",
        description: "Failed to delete influencer",
        variant: "destructive"
      });
    } finally {
      setDeleteInfluencerId(null);
    }
  };

  const handleEditClick = (influencer: Influencer) => {
    setEditingInfluencer(influencer);
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingInfluencer || !token) return;

    try {
      // Call update API here (you'll need to add this to your api.ts)
      // await updateInfluencer(token, editingInfluencer._id, {...});
      
      toast({
        title: "Influencer updated",
        description: "The influencer has been updated",
      });
      
      // Refresh the list
      const data = await fetchInfluencers(token);
      setInfluencers(data);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating influencer:", error);
      toast({
        title: "Error",
        description: "Failed to update influencer",
        variant: "destructive"
      });
    }
  };

  const filteredInfluencers = influencers.filter(influencer => {
    const searchLower = searchQuery.toLowerCase();
    return (
      influencer.channel_id.toLowerCase().includes(searchLower) ||
      (influencer.username?.toLowerCase().includes(searchLower)) ||
      (influencer.display_name?.toLowerCase().includes(searchLower)) ||
      influencer.industry.toLowerCase().includes(searchLower) ||
      influencer.industry_type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Influencer</CardTitle>
          <CardDescription>
            All fields are required
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Platform *</label>
                <Select 
                  value={platform} 
                  onValueChange={setPlatform}
                  required
                >
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
                <label className="text-sm font-medium">Channel ID *</label>
                {platform === "youtube" ? (
                  <div className="relative">
                    <Input
                      value={youtubeSearchTerm}
                      onChange={(e) => {
                        setYoutubeSearchTerm(e.target.value);
                        setUrlError("");
                        // Clear channel ID if user starts typing again
                        if (channelId && e.target.value !== selectedChannel?.display_name) {
                          setChannelId("");
                          setSelectedChannel(null);
                        }
                      }}
                      placeholder="Search for a YouTube channel..."
                      className="mt-1"
                    />
                    
                    {/* Loading indicator */}
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Clear button */}
                    {youtubeSearchTerm && (
                      <button
                        type="button"
                        onClick={clearChannelSelection}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    )}
                    
                    {urlError && (
                      <p className="text-sm text-destructive mt-1">{urlError}</p>
                    )}
                    
                    {/* Show selected channel info */}
                    {channelId && selectedChannel && (
                      <div className="mt-2 p-2 bg-accent rounded-lg">
                        <p className="text-sm font-medium">Selected Channel:</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedChannel.profile_picture} />
                            <AvatarFallback>
                              {selectedChannel.display_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{selectedChannel.display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedChannel.subscribers.toLocaleString()} subscribers
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Search results dropdown */}
                    {!isSearching && searchResults.length > 0 && !channelId && (
                      <div className="absolute z-10 w-full mt-1 border rounded-lg bg-background shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((channel) => (
                          <div
                            key={channel.channel_id}
                            className="p-3 hover:bg-accent cursor-pointer flex items-center gap-3 border-b last:border-b-0"
                            onClick={() => handleChannelSelect(channel)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={channel.profile_picture} />
                              <AvatarFallback>
                                {channel.display_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{channel.display_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {channel.subscribers.toLocaleString()} subscribers
                              </p>
                              <p className="text-xs font-mono text-muted-foreground mt-1 truncate">
                                {channel.channel_id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No results message */}
                    {!isSearching && youtubeSearchTerm.length >= 3 && searchResults.length === 0 && !channelId && (
                      <div className="absolute z-10 w-full mt-1 border rounded-lg bg-background shadow-lg p-3">
                        <p className="text-sm text-muted-foreground text-center">
                          No channels found for "{youtubeSearchTerm}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    placeholder="Channel or account ID"
                    className="mt-1"
                    required
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Industry *</label>
                <Select 
                  value={industry} 
                  onValueChange={setIndustry}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Industry Type *</label>
                <Select
                  value={industryType}
                  onValueChange={setIndustryType}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select industry type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Influencers</CardTitle>
              <CardDescription>
                Manage influencers and their content processing status
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search influencers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredInfluencers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No influencers found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Analyzed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInfluencers.map((influencer) => (
                  <TableRow key={influencer._id}>
                    <TableCell className="font-medium">
                      {influencer.channel_id}
                    </TableCell>
                    <TableCell>{influencer.platform}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{influencer.industry}</span>
                        <span className="text-xs text-muted-foreground">
                          {influencer.industry_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!influencer.is_pause}
                          onCheckedChange={(checked) => 
                            handleTogglePause(influencer._id, !checked)
                          }
                          id={`pause-${influencer._id}`}
                        />
                        <label htmlFor={`pause-${influencer._id}`} className="text-sm">
                          {influencer.is_pause ? "Paused" : "Active"}
                        </label>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(influencer.last_analyzed).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(influencer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(influencer._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteInfluencerId}
        onOpenChange={(open) => !open && setDeleteInfluencerId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the influencer and stop all future content processing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Influencer</DialogTitle>
            <DialogDescription>
              Update influencer details
            </DialogDescription>
          </DialogHeader>
          {editingInfluencer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="channelId" className="text-right">
                  Channel ID
                </label>
                <Input
                  id="channelId"
                  defaultValue={editingInfluencer.channel_id}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="platform" className="text-right">
                  Platform
                </label>
                <Select defaultValue={editingInfluencer.platform}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Channel Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Channel Selection</DialogTitle>
            <DialogDescription>
              You've selected the following YouTube channel:
            </DialogDescription>
          </DialogHeader>
          {selectedChannel && (
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedChannel.profile_picture} />
                <AvatarFallback>
                  {selectedChannel.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedChannel.display_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedChannel.subscribers.toLocaleString()} subscribers
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  ID: {selectedChannel.channel_id}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowConfirmation(false);
              clearChannelSelection();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddChannelConfirm}>
              Confirm Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};