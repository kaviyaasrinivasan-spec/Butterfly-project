import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Camera, Sparkles, RefreshCcw, Brain, Database, FileSearch, GitCompareArrows, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { mockProducts } from "@/lib/mock-data";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "AI Compare · AI Recognition POC" },
      { name: "description", content: "Upload a product image to identify the matching model from your catalog using AI vector search." },
    ],
  }),
  component: Compare,
});

const matched = mockProducts[0];
const similar = mockProducts.slice(0, 5).map((p, i) => ({
  ...p,
  similarity: [98.4, 92.1, 87.6, 81.3, 76.0][i],
}));

const pipeline = [
  { icon: Upload, label: "Image received", done: true },
  { icon: Brain, label: "Embedding generated", done: true },
  { icon: FileSearch, label: "OCR extracted", done: true },
  { icon: Database, label: "Vector DB queried", done: true },
  { icon: GitCompareArrows, label: "Similarity ranked", done: true },
];

function Compare() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const API_BASE = window.location.port === "8080" ? "http://localhost:5000" : "";

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  const handleRunMatch = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_BASE}/api/identify`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  // If there's a match, get best
  const matched = result?.matches?.[0];
  const isExact = matched && result.confidence >= 99;

  return (
    <>
      <AppHeader title="AI Compare" subtitle="Upload an image and identify the product instantly" />
      <main className="p-4 md:p-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Upload */}
        <Card className="xl:col-span-1 shadow-soft">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Upload Product Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-2xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-primary-glow/5 p-6 text-center hover:border-primary transition-colors">
              <input type="file" onChange={handleFile} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {preview ? (
                <div className="aspect-square rounded-xl overflow-hidden bg-muted/40 mb-4">
                  <img src={preview} alt="Uploaded preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground mb-4">
                  <Upload className="h-10 w-10 opacity-30" />
                </div>
              )}
              {file && <p className="text-sm font-medium">{file.name}</p>}
              <p className="text-[11px] text-muted-foreground mb-3">512 KB · JPEG/PNG</p>
              <div className="flex gap-2 justify-center relative z-0">
                <Button size="sm" type="button" className="gradient-primary text-primary-foreground pointer-events-none">
                  <Upload className="h-4 w-4 mr-1.5" />Browse Image
                </Button>
              </div>
            </div>

            <Button onClick={handleRunMatch} disabled={!file || loading} className="w-full gradient-primary text-primary-foreground shadow-glow">
              {loading ? (
                <RefreshCcw className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1.5" />
              )}
              {loading ? "Analyzing..." : "Run AI Match"}
            </Button>
            
            {result?.error && (
              <p className="text-sm text-destructive">{result.error}</p>
            )}

            <div className="rounded-xl border bg-muted/30 p-3 space-y-2.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Processing Pipeline</p>
              {pipeline.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <div className={`h-6 w-6 rounded-full grid place-items-center ${(loading && s.label === "Image received") || result ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                    {(loading && s.label === "Image received") || result ? <CheckCircle2 className="h-3.5 w-3.5" /> : <s.icon className="h-3.5 w-3.5" />}
                  </div>
                  <span>{s.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{(loading && s.label === "Image received") || result ? "ok" : "—"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        <div className="xl:col-span-2 space-y-5">
          {result && (
            <Card className="shadow-elegant relative overflow-hidden animate-float-up">
              <div className="absolute inset-0 gradient-primary opacity-[0.06]" />
              <CardContent className="p-6 relative">
                {matched ? (
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <img src={API_BASE + matched.image_url} alt={matched.model_name} className="h-32 w-32 rounded-2xl object-cover shadow-soft" />
                    <div className="flex-1">
                      <Badge className={`${isExact ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'} hover:bg-success/20 mb-2`}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {isExact ? 'Exact Match Found' : 'Possible Match'}
                      </Badge>
                      <h2 className="text-2xl font-semibold tracking-tight">{matched.model_name}</h2>
                      <p className="text-sm text-muted-foreground">Category: {matched.category}</p>
                      <p className="text-sm mt-2 max-w-xl">{matched.description || result.reasoning}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-xs text-muted-foreground uppercase">Confidence</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">{result.confidence}%</p>
                      <Progress value={result.confidence} className="mt-2 h-1.5 w-32 mx-auto md:ml-auto" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Badge variant="destructive" className="mb-4">No Match</Badge>
                    <h2 className="text-xl font-semibold">{result.reasoning || "Product not found in Database."}</h2>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {result && matched && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Target Database Match Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">Model Number</span>
                    <span className="font-mono">{matched.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Analysis Features utilized</span>
                    <div className="flex gap-1 mt-1">
                      {result.identified_features?.map((f: string) => (
                        <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}