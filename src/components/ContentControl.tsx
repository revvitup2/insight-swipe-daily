
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { MoreVertical, UserX, EyeOff, Flag } from "lucide-react";

interface ContentControlProps {
  influencerName: string;
  topic: string;
  onHideInfluencer: () => void;
  onHideTopic: () => void;
  onReport: () => void;
}

const ContentControl = ({ 
  influencerName, 
  topic, 
  onHideInfluencer, 
  onHideTopic, 
  onReport 
}: ContentControlProps) => {
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleHideInfluencer = () => {
    onHideInfluencer();
    toast({
      title: "Content Hidden",
      description: `You won't see posts from ${influencerName} anymore`,
    });
  };

  const handleHideTopic = () => {
    onHideTopic();
    toast({
      title: "Topic Hidden",
      description: `You won't see posts about ${topic} anymore`,
    });
  };

  const handleReport = () => {
    setShowReportDialog(true);
  };

  const submitReport = () => {
    onReport();
    setShowReportDialog(false);
    toast({
      title: "Report Submitted",
      description: "Thank you for your feedback. We'll review this content.",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleHideInfluencer}>
            <UserX className="mr-2 h-4 w-4" />
            Don't show posts from {influencerName}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleHideTopic}>
            <EyeOff className="mr-2 h-4 w-4" />
            Don't show posts on {topic}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleReport}>
            <Flag className="mr-2 h-4 w-4" />
            Report this content
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Help us understand what's wrong with this content. Your report will be reviewed by our team.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitReport}>
                Submit Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContentControl;
