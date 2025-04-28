
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { toast } from "@/hooks/use-toast";

interface ExploreInfluencer {
  id: string;
  name: string;
  profileImage: string;
  industry: string;
  bio: string;
  followers: number;
  isFollowed: boolean;
}

interface ExploreCategory {
  id: string;
  name: string;
  icon: string;
  influencers: ExploreInfluencer[];
}

const exploreCategories: ExploreCategory[] = [
  {
    id: "trending",
    name: "Hot Today 🔥",
    icon: "🔥",
    influencers: [
      {
        id: "e1",
        name: "Emma Wilson",
        profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100",
        industry: "Finance",
        bio: "Finance strategist breaking down complex market trends",
        followers: 542000,
        isFollowed: false
      },
      {
        id: "e2",
        name: "James Rivera",
        profileImage: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=100",
        industry: "Technology",
        bio: "Tech analyst focusing on emerging market innovations",
        followers: 328000,
        isFollowed: false
      },
      {
        id: "e3",
        name: "Kate Phillips",
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100",
        industry: "Marketing",
        bio: "Marketing genius with insights on consumer behavior",
        followers: 189000,
        isFollowed: false
      }
    ]
  },
  {
    id: "emerging",
    name: "Emerging Voices 🚀",
    icon: "🚀",
    influencers: [
      {
        id: "e4",
        name: "Ryan Chang",
        profileImage: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=100",
        industry: "Startups",
        bio: "Startup founder sharing the journey of building companies",
        followers: 78000,
        isFollowed: false
      },
      {
        id: "e5",
        name: "Leila Ahmed",
        profileImage: "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?q=80&w=100",
        industry: "Design",
        bio: "Design thinker exploring the intersection of art and function",
        followers: 92000,
        isFollowed: false
      },
      {
        id: "e6",
        name: "Daniel Park",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100",
        industry: "Business",
        bio: "Business strategist with a focus on sustainable growth",
        followers: 67000,
        isFollowed: false
      }
    ]
  },
  {
    id: "ai",
    name: "Leaders in AI 💡",
    icon: "💡",
    influencers: [
      {
        id: "i1",
        name: "Alex Chen",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100",
        industry: "AI",
        bio: "AI researcher and tech entrepreneur. Former lead at DeepMind.",
        followers: 248500,
        isFollowed: false
      },
      {
        id: "e7",
        name: "Sophia Williams",
        profileImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=100",
        industry: "AI",
        bio: "AI ethics researcher focusing on responsible deployment",
        followers: 156000,
        isFollowed: false
      },
      {
        id: "e8",
        name: "Marcus Johnson",
        profileImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?q=80&w=100",
        industry: "AI",
        bio: "Machine learning engineer demystifying complex AI concepts",
        followers: 203000,
        isFollowed: false
      }
    ]
  },
  {
    id: "healthcare",
    name: "Healthcare Trailblazers 🏥",
    icon: "🏥",
    influencers: [
      {
        id: "i4",
        name: "Dr. Lisa Patel",
        profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=100",
        industry: "Healthcare",
        bio: "Physician and healthcare innovator focused on preventive medicine",
        followers: 187000,
        isFollowed: false
      },
      {
        id: "e9",
        name: "Dr. Robert Kim",
        profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=100",
        industry: "Healthcare",
        bio: "Neuroscientist sharing breakthroughs in brain research",
        followers: 134000,
        isFollowed: false
      },
      {
        id: "e10",
        name: "Dr. Amara Nelson",
        profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=100",
        industry: "Healthcare",
        bio: "Public health expert analyzing global health trends",
        followers: 159000,
        isFollowed: false
      }
    ]
  }
];

const Explore = () => {
  const [categories, setCategories] = useState(exploreCategories);
  
  const handleFollowToggle = (categoryId: string, influencerId: string) => {
    setCategories(categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          influencers: category.influencers.map(influencer => {
            if (influencer.id === influencerId) {
              return {...influencer, isFollowed: !influencer.isFollowed};
            }
            return influencer;
          })
        };
      }
      return category;
    }));
    
    const category = categories.find(c => c.id === categoryId);
    const influencer = category?.influencers.find(i => i.id === influencerId);
    
    if (influencer) {
      toast({
        title: influencer.isFollowed 
          ? `Unfollowed ${influencer.name}`
          : `Following ${influencer.name}`,
        description: influencer.isFollowed 
          ? "You won't see their content in your feed"
          : "You'll see their insights in your feed",
      });
    }
  };
  
  return (
    <div className="page-container bg-background">
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-6">Explore</h1>
        
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="trending">🔥</TabsTrigger>
            <TabsTrigger value="emerging">🚀</TabsTrigger>
            <TabsTrigger value="ai">💡</TabsTrigger>
            <TabsTrigger value="healthcare">🏥</TabsTrigger>
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">{category.name}</h2>
              
              <div className="space-y-4">
                {category.influencers.map(influencer => (
                  <div key={influencer.id} className="influencer-card">
                    <div className="w-20 h-20 mr-4">
                      <img 
                        src={influencer.profileImage}
                        alt={influencer.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{influencer.name}</h3>
                        <span className="industry-tag">{influencer.industry}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {influencer.bio}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {influencer.followers.toLocaleString()} followers
                        </span>
                        
                        <Button
                          variant={influencer.isFollowed ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowToggle(category.id, influencer.id)}
                          className="text-xs"
                        >
                          {influencer.isFollowed ? "Following" : "Follow"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Explore;
