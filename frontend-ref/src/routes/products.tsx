import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, Filter, Download, Image as ImageIcon } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Product Master · AI Recognition POC" },
      { name: "description", content: "Manage product models, brands and categories in the master catalog." },
    ],
  }),
  component: Products,
});

const API_BASE = window.location.port === "8080" ? "http://localhost:5000" : "";

function Products() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/catalog`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this product?")) return;
    try {
      await fetch(`${API_BASE}/api/client/delete_product/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = useMemo(
    () => products.filter((p) =>
      [p.model_name, p.category, p.description].join(" ").toLowerCase().includes(query.toLowerCase())
    ),
    [query, products],
  );

  return (
    <>
      <AppHeader title="Product Master" subtitle="Create and manage product models" />
      <main className="p-4 md:p-6 space-y-5">
        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, category…" className="pl-9 bg-muted/40" />
            </div>
            <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1.5" />Filter</Button>
            <ProductDialog
              onSuccess={fetchProducts}
              trigger={
                <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow">
                  <Plus className="h-4 w-4 mr-1.5" />Add Product
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card className="shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-6">Loading backend catalog...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-6">No products found. Add one above.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={API_BASE + p.image_url} alt={p.model_name} className="h-10 w-10 rounded-lg object-cover bg-muted" />
                      <div>
                        <p className="font-medium text-sm">{p.model_name}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">{p.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.images?.length || 0} files</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleDelete(p.id)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </>
  );
}

function ProductDialog({ trigger, onSuccess }: { trigger: React.ReactNode, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [modelName, setModelName] = useState("");
  const [category, setCategory] = useState("Kitchen Appliances");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSave = async () => {
    if(!modelName || !file) return alert("Model Name and Image are required");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("model_name", modelName);
    formData.append("category", category);
    formData.append("description", desc);
    formData.append("image", file);
    
    try {
      await fetch(`${API_BASE}/api/client/add_product`, {
        method: "POST",
        body: formData,
      });
      setOpen(false);
      onSuccess();
      // reset
      setModelName("");
      setDesc("");
      setFile(null);
    } catch(e) {
      console.error(e);
      alert("Error adding product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Product to Database</DialogTitle>
          <DialogDescription>Add a new reference model. This image is what the AI will match against.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field label="Product Model / Name">
            <Input value={modelName} onChange={e => setModelName(e.target.value)} placeholder="e.g. Butterfly Rapid Wet Grinder" />
          </Field>
          <Field label="Category">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {["Kitchen Appliances", "Cookware", "Small Appliances", "Spares", "Other"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reference Image">
            <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          </Field>
          <Field label="Description">
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Key identifying features..." />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={loading} onClick={handleSave} className="gradient-primary text-primary-foreground">
            {loading ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}