import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockProducts, productImages } from "@/lib/mock-data";
import { Upload, Star, X, Image as ImageIcon, Camera } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/images")({
  head: () => ({
    meta: [
      { title: "Image Manager · AI Recognition POC" },
      { name: "description", content: "Upload and manage multiple product images per model for the AI engine." },
    ],
  }),
  component: ImageManager,
});

function ImageManager() {
  const [selected, setSelected] = useState(mockProducts[0].id);
  const product = mockProducts.find((p) => p.id === selected)!;
  const images = productImages(selected);

  return (
    <>
      <AppHeader title="Image Manager" subtitle="Upload product images across angles, lighting and packaging" />
      <main className="p-4 md:p-6 space-y-5">
        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={product.thumbnail} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.model} · {product.brand}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full md:w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {p.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="whitespace-nowrap">{images.length} images</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-dashed border-2 border-primary/30 hover:border-primary/60 hover:shadow-elegant transition-all">
          <CardContent className="p-10">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-16 w-16 rounded-2xl gradient-primary grid place-items-center shadow-glow">
                <Upload className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Drag & drop images here</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Upload front, side, top, packaging shots and varied lighting conditions. PNG / JPG up to 10 MB each.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <Button className="gradient-primary text-primary-foreground"><Upload className="h-4 w-4 mr-1.5" />Browse files</Button>
                <Button variant="outline"><Camera className="h-4 w-4 mr-1.5" />Capture from camera</Button>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center pt-3">
                {["Front", "Side", "Top", "Back", "Packaging", "Low light", "Macro"].map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Image Library</CardTitle>
            <p className="text-xs text-muted-foreground">{images.length} images · 1 primary</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden border bg-muted aspect-square shadow-soft hover:shadow-elegant transition-all">
                  <img src={img.url} alt={img.label} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  {img.primary && (
                    <Badge className="absolute top-2 left-2 bg-warning text-warning-foreground gap-1">
                      <Star className="h-3 w-3 fill-current" /> Primary
                    </Badge>
                  )}
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 backdrop-blur">
                    {img.label}
                  </Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                    {!img.primary && (
                      <Button size="sm" variant="secondary" className="h-7 text-xs">
                        <Star className="h-3 w-3 mr-1" />Make primary
                      </Button>
                    )}
                    <Button size="icon" variant="destructive" className="h-7 w-7 ml-auto">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}