import { useState } from "react";
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
import { createInfluencer } from "@/lib/api";

interface InfluencerSubmission {
  id: string;
  platform: string;
  channelId: string;
  industry: string;
  industryType: string;
}

const INDUSTRY_OPTIONS = [
  "Artificial Intelligence (AI)",
  "Technology",
  "Finance",
  "Healthcare",
  "Startups",
  "Business",
  "Marketing",
  "Design"
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
  const [recentAdditions, setRecentAdditions] = useState<InfluencerSubmission[]>([]);
  const [deleteInfluencerId, setDeleteInfluencerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<InfluencerSubmission | null>(null);
  
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
      
      const newInfluencer: InfluencerSubmission = {
        id: Math.random().toString(36).substring(2, 9),
        platform,
        channelId,
        industry,
        industryType
      };
      
      toast({
        title: "Influencer added",
        description: "The influencer has been added for content processing",
      });
      
      setRecentAdditions([newInfluencer, ...recentAdditions]);
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

  // ... (keep other existing functions like handleConfirmDelete, handleDeleteInfluencer, etc.)

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

      {/* ... (rest of the component remains the same) ... */}
    </div>
  );
};