"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPostsTab } from "@/components/admin/AdminPostsTab";
import { AdminPromptsTab } from "@/components/admin/AdminPromptsTab";
import { AdminInfluencersTab } from "@/components/admin/AdminInfluencersTab";

interface AdminDashboardProps {
  activeTab?: "posts" | "prompts" | "influencers";
}

const AdminDashboard = ({ activeTab = "posts" }: AdminDashboardProps) => {
  const [currentTab, setCurrentTab] = useState<string>(activeTab);
  const navigate = useNavigate();
  
  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };
  
  const handleTabChange = (value: string) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      return;
    }
    setCurrentTab(value);
    navigate(`/admin/${value}`);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary mr-2">ByteMe</h1>
            <span className="text-sm bg-gray-100 px-2 py-0.5 rounded">Admin</span>
          </div>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <Tabs 
          value={currentTab} 
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="influencers">Influencers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts">
            <AdminPostsTab />
          </TabsContent>
          
          <TabsContent value="prompts">
            <AdminPromptsTab />
          </TabsContent>
          
          <TabsContent value="influencers">
            <AdminInfluencersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;