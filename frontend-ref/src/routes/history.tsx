import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Search History · AI Recognition POC" },
      { name: "description", content: "Browse past AI product recognition searches with confidence scores." },
    ],
  }),
  component: History,
});

function History() {
  return (
    <>
      <AppHeader title="Search History" subtitle="All previous AI matches" />
      <main className="p-4 md:p-6 space-y-5">
        <Card className="shadow-soft">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by product, model or scan id…" className="pl-9 bg-muted/40" disabled />
            </div>
            <Button variant="outline" size="sm" disabled><Filter className="h-4 w-4 mr-1.5" />Filter</Button>
            <Button variant="outline" size="sm" disabled><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Scan</TableHead>
                <TableHead>Detected Product</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Match %</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No active search history stored in the backend database yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </main>
    </>
  );
}