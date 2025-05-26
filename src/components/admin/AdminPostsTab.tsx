
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Insight } from "@/components/InsightCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Search,Copy  } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchFeedItems, updateFeedItem,deleteFeedItem } from "@/lib/api";

export const AdminPostsTab = () => {
  const [posts, setPosts] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Insight | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    // In a real app, this would fetch from your actual API
    const fetchBytes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/feed`);
        const data = await response.json();
        
       const formattedBytes = data.map((item: any) => ({
  id: item.video_id,
  title: item.metadata.title,
  summary: item.analysis.summary,
  image: item.metadata.thumbnails.high.url,
  industry: item.industry || "General",
  influencer: {
    id: item.influencer_id,
    name: item.metadata.channel_title,
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.metadata.channel_title)}`,
    isFollowed: false,
    channel_id: item.metadata.channel_id // Add this line
  },
  isSaved: false,
  isLiked: false,
  keyPoints: item.analysis.key_points,
  sentiment: item.analysis.sentiment,
  publishedAt: item.published_at,
  source: "youtube",
  sourceUrl: `https://youtube.com/watch?v=${item.video_id}`
}));
        
        setPosts(formattedBytes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching Bytes:", error);
        toast({
          title: "Error",
          description: "Failed to fetch posts",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchBytes();
  }, []);
  
  const handleConfirmDelete = (id: string) => {
    setDeletePostId(id);
  };

// Update the handleDeletePost function
const handleDeletePost = async () => {
  if (!deletePostId) return;

  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    await deleteFeedItem(token, deletePostId);
    
    setPosts(posts.filter(post => post.id !== deletePostId));
    toast({
      title: "Post deleted",
      description: "The post has been successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    toast({
      title: "Error",
      description: "Failed to delete post",
      variant: "destructive"
    });
  } finally {
    setDeletePostId(null);
  }
};
  
  const handleEditPost = (post: Insight) => {
    setEditingPost({...post});
    setIsEditDialogOpen(true);
  };

  const handleCopyChannelId = (channelId: string) => {
  navigator.clipboard.writeText(channelId)
    .then(() => {
      toast({
        title: "Copied!",
        description: "Channel ID copied to clipboard",
      });
    })
    .catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy Channel ID",
        variant: "destructive"
      });
    });
};

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      await updateFeedItem(token, editingPost.id, {
        metadata: {
          title: editingPost.title
        },
        analysis: {
          summary: editingPost.summary
        }
      });
      
      setPosts(posts.map(post => 
        post.id === editingPost.id ? editingPost : post
      ));
      
      toast({
        title: "Post updated",
        description: "Changes have been saved",
      });
      
      setIsEditDialogOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive"
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.influencer.name.toLowerCase().includes(searchQuery.toLowerCase());
                         
    const matchesCategory = filterCategory === "all" || !filterCategory 
      ? true 
      : post.industry.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories for the filter
  const categories = Array.from(new Set(posts.map(post => post.industry)));
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No posts match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPosts.map(post => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/4 h-48 md:h-auto">
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold line-clamp-1">{post.title}</h3>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {post.industry}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        <img
                          src={post.influencer.profileImage}
                          alt={post.influencer.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-sm text-muted-foreground">
                          {post.influencer.name}
                        </span>
                      </div>
                      
                      <p className="text-sm line-clamp-2 mb-4">
                        {post.summary}
                      </p>
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Published: {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">

    

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPost(post)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleConfirmDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                        </div>
                                                 <Button 
      variant="outline" 
      size="sm"
      onClick={() => handleCopyChannelId(post.influencer.channel_id)}
    >
      <Copy className="h-4 w-4 mr-1" /> Copy Channel ID
    </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to the post details below.
            </DialogDescription>
          </DialogHeader>

          {editingPost && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input 
                  id="title"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="summary" className="text-sm font-medium">Summary</label>
                <Textarea
                  id="summary"
                  value={editingPost.summary}
                  onChange={(e) => setEditingPost({...editingPost, summary: e.target.value})}
                  rows={5}
                />
              </div>
              
              {/* <div className="grid gap-2">
                <label htmlFor="image" className="text-sm font-medium">Image URL</label>
                <Input
                  id="image"
                  value={editingPost.image}
                  onChange={(e) => setEditingPost({...editingPost, image: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-32 rounded overflow-hidden">
                  <img 
                    src={editingPost.image} 
                    alt="Post preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/800x450?text=Image+Preview";
                    }}
                  />
                </div>
              </div> */}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
