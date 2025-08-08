import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { aiTools } from "@/data/tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ToolDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const tool = useMemo(() => aiTools.find(t => t.slug === slug), [slug]);

  useEffect(() => {
    if (!tool) return;
    document.title = `${tool.name} — AI Tool | ByteMe`;
    const desc = `${tool.name}: ${tool.description}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
  }, [tool]);

  if (!tool) {
    return (
      <main className="container mx-auto px-4 py-12">
        <p className="text-muted-foreground">Tool not found.</p>
        <Button asChild className="mt-4"><Link to="/tools">Back to tools</Link></Button>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: tool.name,
    description: tool.description,
    url: window.location.href,
    brand: { "@type": "Brand", name: tool.name },
    offers: {
      "@type": "Offer",
      url: tool.url,
      priceCurrency: "USD",
      price: "0",
      availability: "https://schema.org/InStock"
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
        <p className="text-muted-foreground mt-1">{tool.description}</p>
      </header>

      <section className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Key specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {tool.keySpecifications.map((k) => (
                <li key={k} className="text-sm">{k}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tool.pricing}</p>
            </CardContent>
          </Card>

          {tool.hotOffers?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Hot offers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {tool.hotOffers.map((o) => (
                    <li key={o} className="text-sm">{o}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex gap-2">
            <Button asChild><a href={tool.url} target="_blank" rel="noopener noreferrer">Try now</a></Button>
            <Button asChild variant="outline"><Link to="/tools">Back</Link></Button>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
};

export default ToolDetails;
