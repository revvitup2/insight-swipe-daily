
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

interface Prompt {
  id: string;
  name: string;
  content: string;
  category?: string;
}

export const AdminPromptsTab = () => {
  // Sample prompts data
  const [globalPrompts, setGlobalPrompts] = useState<Prompt[]>([
    {
      id: "global-1",
      name: "Summary Generator",
      content: "Create a concise yet comprehensive summary of the content in 3-4 sentences."
    },
    {
      id: "global-2",
      name: "Key Points Extractor",
      content: "Extract the 3-5 most important points from the content."
    }
  ]);
  
  const [categoryPrompts, setCategoryPrompts] = useState<Prompt[]>([
    {
      id: "cat-1",
      name: "Finance Analysis",
      content: "Analyze this financial content by highlighting market trends, investment insights, and economic forecasts.",
      category: "finance"
    },
    {
      id: "cat-2",
      name: "Tech Breakdown",
      content: "Break down this technical content focusing on innovation, technical specifications, and industry impact.",
      category: "technology"
    }
  ]);
  
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptName, setPromptName] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [promptCategory, setPromptCategory] = useState("");
  const [currentTab, setCurrentTab] = useState<"global" | "category">("global");
  
  const handleSavePrompt = () => {
    if (!promptName || !promptContent) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newPrompt: Prompt = {
      id: selectedPrompt?.id || `prompt-${Date.now()}`,
      name: promptName,
      content: promptContent,
      ...(currentTab === "category" && { category: promptCategory }),
    };
    
    if (selectedPrompt) {
      // Update existing prompt
      if (currentTab === "global") {
        setGlobalPrompts(globalPrompts.map(p => 
          p.id === selectedPrompt.id ? newPrompt : p
        ));
      } else {
        setCategoryPrompts(categoryPrompts.map(p => 
          p.id === selectedPrompt.id ? newPrompt : p
        ));
      }
      
      toast({
        title: "Prompt updated",
        description: `${promptName} has been updated`,
      });
    } else {
      // Create new prompt
      if (currentTab === "global") {
        setGlobalPrompts([...globalPrompts, newPrompt]);
      } else {
        setCategoryPrompts([...categoryPrompts, newPrompt]);
      }
      
      toast({
        title: "Prompt created",
        description: `${promptName} has been added to ${currentTab} prompts`,
      });
    }
    
    // Reset form
    resetForm();
  };
  
  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptName(prompt.name);
    setPromptContent(prompt.content);
    if (prompt.category) {
      setPromptCategory(prompt.category);
      setCurrentTab("category");
    } else {
      setCurrentTab("global");
    }
  };
  
  const handleDeletePrompt = (id: string, isGlobal: boolean) => {
    if (isGlobal) {
      setGlobalPrompts(globalPrompts.filter(p => p.id !== id));
    } else {
      setCategoryPrompts(categoryPrompts.filter(p => p.id !== id));
    }
    
    toast({
      title: "Prompt deleted",
      description: "The prompt has been removed",
    });
  };
  
  const resetForm = () => {
    setSelectedPrompt(null);
    setPromptName("");
    setPromptContent("");
    setPromptCategory("");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedPrompt ? "Edit Prompt" : "Create New Prompt"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "global" | "category")}>
            <TabsList className="mb-4">
              <TabsTrigger value="global">Global Prompt</TabsTrigger>
              <TabsTrigger value="category">Category Prompt</TabsTrigger>
            </TabsList>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Prompt Name</label>
                <Input
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  placeholder="E.g., Summary Generator"
                  className="mt-1"
                />
              </div>
              
              {currentTab === "category" && (
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={promptCategory} onValueChange={setPromptCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Prompt Content</label>
                <Textarea
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  placeholder="Enter your prompt template here..."
                  className="mt-1 min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSavePrompt}>
                  {selectedPrompt ? "Update Prompt" : "Save Prompt"}
                </Button>
                
                {selectedPrompt && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Global Prompts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalPrompts.map(prompt => (
              <Card key={prompt.id}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{prompt.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {prompt.content}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPrompt(prompt)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id, true)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Category Prompts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryPrompts.map(prompt => (
              <Card key={prompt.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{prompt.name}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {prompt.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {prompt.content}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditPrompt(prompt)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id, false)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
