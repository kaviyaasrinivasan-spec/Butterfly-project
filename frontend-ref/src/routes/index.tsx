import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Images, ScanSearch, Target, ArrowUpRight, Activity, Database, Zap, Brain, FileSearch, GitCompareArrows, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { techBadges } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AI Product Recognition POC" },
      { name: "description", content: "AI-powered product recognition dashboard with vector search and visual matching." },
    ],
  }),
  component: Dashboard,
});

const workflow = [
  { icon: Images, label: "Upload Image" },
  { icon: Brain, label: "AI Processing" },
  { icon: Database, label: "PyTorch Search" },
  { icon: GitCompareArrows, label: "Model Match" },
  { icon: Target, label: "Result" },
];

const engines = [
  { icon: Brain, label: "AI Engine", status: "Online", load: 64 },
  { icon: Database, label: "Vector DB", status: "Healthy", load: 38 },
  { icon: GitCompareArrows, label: "Similarity Matching", status: "Online", load: 81 },
];

const API_BASE = window.location.port === "8080" ? "http://localhost:5000" : "";

function Dashboard() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/catalog`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

  const totalImages = products.reduce((acc, p) => acc + (p.images?.length || 0), 0);

  const kpis = [
    { label: "Total Products", value: products.length, icon: Package, delta: "Live Database", tone: "text-primary" },
    { label: "Total Images", value: totalImages, icon: Images, delta: "Indexed", tone: "text-primary-glow" },
    { label: "Recent Searches", value: "0", icon: ScanSearch, delta: "Ready", tone: "text-success" },
    { label: "Match Accuracy", value: `99%`, icon: Target, delta: "Strict threshold", tone: "text-warning" },
  ];

  return (
    <>
      <AppHeader title="Dashboard" subtitle="Overview of your AI recognition workspace" />
      <main className="p-4 md:p-6 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-soft">
          <div className="absolute inset-0 gradient-primary opacity-[0.07]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 mb-3">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow inline-block" />
                Live AI Recognition Engine
              </Badge>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Identify any product in <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">milliseconds</span>
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
                Upload a product image and our local PyTorch CNN engine returns the exact match from your master catalog.
              </p>
            </div>
            <Button asChild size="lg" className="gradient-primary shadow-glow text-primary-foreground">
              <Link to="/compare">
                Try AI Compare <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <Card key={k.label} className="shadow-soft hover:shadow-elegant transition-all animate-float-up" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight">{k.value}</p>
                    <p className="mt-1 text-xs text-success">{k.delta}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl bg-primary/10 grid place-items-center ${k.tone}`}>
                    <k.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Workflow */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Recognition Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-2">
              {workflow.map((w, i) => (
                <div key={w.label} className="flex md:flex-1 items-center gap-3 md:flex-col md:text-center">
                  <div className="flex md:flex-col items-center gap-3 md:gap-2 w-full">
                    <div className="h-12 w-12 shrink-0 rounded-2xl gradient-primary grid place-items-center shadow-glow">
                      <w.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="md:mt-1">
                      <p className="text-sm font-medium">{w.label}</p>
                      <p className="text-[11px] text-muted-foreground">Step {i + 1}</p>
                    </div>
                  </div>
                  {i < workflow.length - 1 && (
                    <ArrowRight className="hidden md:block h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lower grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {engines.map((e) => (
                <div key={e.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><e.icon className="h-3.5 w-3.5 text-primary" /> {e.label}</span>
                    <span className="text-xs text-success">{e.status}</span>
                  </div>
                  <Progress value={e.load} className="mt-2 h-1.5" />
                </div>
              ))}
              <div className="pt-4 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px]">PyTorch</Badge>
                <Badge variant="secondary" className="text-[10px]">ResNet50</Badge>
                <Badge variant="secondary" className="text-[10px]">Local Database</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Featured products */}
          <Card className="shadow-soft overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Catalog Preview</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/products">Manage <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <div className="divide-y">
                {products.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">No products added yet.</div>
                )}
                {products.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <img src={API_BASE + p.image_url} alt={p.model_name} className="h-12 w-12 rounded-lg object-cover bg-muted" />
                    <div>
                      <p className="text-sm font-medium">{p.model_name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}