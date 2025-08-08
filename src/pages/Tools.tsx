import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { aiTools, type ToolCategory } from "@/data/tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories: ToolCategory[] = [
  "Chatbot",
  "Image Generation",
  "Search",
  "Writing",
  "Coding",
  "Productivity",
];

const Tools = () => {
  const [sortBy, setSortBy] = useState<"az" | "trending" | "type">("trending");
  const [selectedType, setSelectedType] = useState<"All" | ToolCategory>("All");

  useEffect(() => {
    document.title = "AI Tools Directory | ByteMe";
    const meta = document.querySelector('meta[name="description"]');
    const description = "Browse AI tools by A–Z, trending, or type. Compare specs, pricing, and offers.";
    if (meta) meta.setAttribute("content", description);
  }, []);

  const tools = useMemo(() => {
    let list = [...aiTools];
    if (sortBy === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "trending") {
      list.sort((a, b) => b.trendingScore - a.trendingScore);
    } else if (sortBy === "type") {
      if (selectedType !== "All") list = list.filter(t => t.type === selectedType);
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [sortBy, selectedType]);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Tools Directory</h1>
        <p className="text-muted-foreground mt-1">Discover, compare, and try AI tools.</p>
      </header>

      <section className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="az">A–Z</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
            </SelectContent>
          </Select>

          {sortBy === "type" && (
            <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.slug} className="hover-scale">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{tool.name}</CardTitle>
                <Badge variant="secondary">{tool.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{tool.description}</p>
              <div className="flex gap-2">
                <Button asChild variant="default" size="sm">
                  <Link to={`/tools/${tool.slug}`}>View details</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">Try now</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
};

export default Tools;
