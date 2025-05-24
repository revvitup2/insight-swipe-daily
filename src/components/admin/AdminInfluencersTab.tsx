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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const INDUSTRY_OPTIONS = [
  "Artificial Intelligence (AI)",
  "Technology",
  "Finance",
  "Healthcare",
  "Startups",
  "Business",
  "Marketing",
  "Design",
  "Others"
];

const INDUSTRY_TYPE_OPTIONS = [
  "B2B",
  "B2C",
  "Enterprise",
  "SaaS",
  "E-commerce",
  "Consumer"
];

export const AdminInfluencersTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [channelId, setChannelId] = useState("");
  const [industry, setIndustry] = useState("");
  const [industryType, setIndustryType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteInfluencerId, setDeleteInfluencerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null);
  
  useEffect(() => {
    const loadInfluencers = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          throw new Error("No authentication token found");
        }
        
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
  }, []);

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
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
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
      setPlatform("");
      setChannelId("");
      setIndustry("");
      setIndustryType("");
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
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
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
    if (!deleteInfluencerId) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
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
    if (!editingInfluencer) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
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
                <Input
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="Channel or account ID"
                  className="mt-1"
                  required
                />
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
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
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
    </div>
  );
};