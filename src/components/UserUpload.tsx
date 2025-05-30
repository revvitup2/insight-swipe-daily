
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Plus, Upload, Link } from "lucide-react";

interface UserUploadProps {
  variant?: "coming-soon" | "processing";
  onUploadComplete?: (content: any) => void;
}

const UserUpload = ({ variant = "coming-soon", onUploadComplete }: UserUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    if (variant === "coming-soon") {
      // Show coming soon modal
      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        setUrl("");
        toast({
          title: "Coming Soon!",
          description: "URL processing feature will be available soon. Stay tuned!",
        });
      }, 1000);
    } else {
      // Processing version - simulate processing
      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        setUrl("");
        const processedContent = {
          id: Date.now().toString(),
          title: "Processed Content from URL",
          summary: "This is a processed summary from the submitted URL.",
          type: "url",
          source: url,
          processedAt: new Date().toISOString()
        };
        onUploadComplete?.(processedContent);
        toast({
          title: "Processing Complete",
          description: "Your content has been processed and added to My Uploads",
        });
      }, 2000);
    }
  };

  const handleFileSubmit = async () => {
    if (!file) {
      toast({
        title: "Error", 
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    if (variant === "coming-soon") {
      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        setFile(null);
        toast({
          title: "Coming Soon!",
          description: "File upload feature will be available soon. Stay tuned!",
        });
      }, 1000);
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setIsOpen(false);
        const processedContent = {
          id: Date.now().toString(),
          title: `Processed: ${file.name}`,
          summary: `This is a processed summary from the uploaded file: ${file.name}`,
          type: "file",
          source: file.name,
          processedAt: new Date().toISOString()
        };
        setFile(null);
        onUploadComplete?.(processedContent);
        toast({
          title: "Processing Complete",
          description: "Your file has been processed and added to My Uploads",
        });
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="icon" 
          className="fixed bottom-20 right-4 rounded-full shadow-lg z-50"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="file">File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">YouTube or Content URL</Label>
              <Input
                id="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleUrlSubmit} 
              disabled={isSubmitting}
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              {isSubmitting ? "Processing..." : "Submit URL"}
            </Button>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload PDF/DOC (Max 5MB)</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button 
              onClick={handleFileSubmit} 
              disabled={isSubmitting}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isSubmitting ? "Processing..." : "Upload File"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserUpload;
