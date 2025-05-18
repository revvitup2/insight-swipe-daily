
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Insight } from "@/components/InsightCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const AdminPostsTab = () => {
  const [posts, setPosts] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  useEffect(() => {
    // In a real app, this would fetch from your actual API
    const fetchInsights = async () => {
      try {
        const response = await fetch('https://influenedoze.weddingmoments.fun/feed');
        const data = await response.json();
        
        const formattedInsights = data.map((item: any) => ({
          id: item.video_id,
          title: item.metadata.title,
          summary: item.analysis.summary,
          image: item.metadata.thumbnails.high.url,
          industry: item.industry || "General",
          influencer: {
            id: item.influencer_id,
            name: item.metadata.channel_title,
            profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.metadata.channel_title)}`,
            isFollowed: false
          },
          isSaved: false,
          isLiked: false,
          keyPoints: item.analysis.key_points,
          sentiment: item.analysis.sentiment,
          publishedAt: item.published_at,
          source: "youtube",
          sourceUrl: `https://youtube.com/watch?v=${item.video_id}`
        }));
        
        setPosts(formattedInsights);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching insights:", error);
        toast({
          title: "Error",
          description: "Failed to fetch posts",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, []);
  
  const handleDeletePost = (id: string) => {
    toast({
      title: "Post deleted",
      description: "The post has been removed from the database",
    });
    setPosts(posts.filter(post => post.id !== id));
  };
  
  const handleEditPost = (id: string) => {
    // In a real app, this would open an edit form
    toast({
      title: "Edit post",
      description: "Edit functionality would open here",
    });
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
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPost(post.id)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
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
    </div>
  );
};
