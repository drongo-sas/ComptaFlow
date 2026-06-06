import { Plus } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customerInvoices, type CustomerInvoice } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";

const statusMap: Record<
  CustomerInvoice["status"],
  { label: string; variant: "secondary" | "default" | "success" | "warning" | "destructive" }
> = {
  draft: { label: "Brouillon", variant: "secondary" },
  sent: { label: "Envoyée", variant: "default" },
  partial: { label: "Partiellement payée", variant: "warning" },
  paid: { label: "Payée", variant: "success" },
  overdue: { label: "En retard", variant: "destructive" },
};

export default function CustomerInvoicesPage() {
  const paid = customerInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding = customerInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue" || i.status === "partial")
    .reduce((s, i) => s + i.total, 0);
  const overdue = customerInvoices.filter((i) => i.status === "overdue").length;

  return (
    <>
      <Topbar title="Factures clients" subtitle="Ventes & encaissements" />
      <div className="bg-paper flex-1 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Encaissé</p>
              <p className="tnum mt-1 font-mono text-xl font-semibold text-success">
                {formatMAD(paid)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Encours</p>
              <p className="tnum mt-1 font-mono text-xl font-semibold">{formatMAD(outstanding)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">En retard</p>
              <p
                className={cn(
                  "tnum mt-1 font-mono text-xl font-semibold",
                  overdue > 0 && "text-destructive"
                )}
              >
                {overdue}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button size="sm">
            <Plus className="size-4" />
            Créer une facture
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Client</TableHead>
                <TableHead>N° facture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerInvoices.map((inv) => {
                const s = statusMap[inv.status];
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.customer}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{inv.number}</TableCell>
                    <TableCell className="tnum whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {formatDate(inv.date)}
                    </TableCell>
                    <TableCell className="tnum whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="tnum text-right font-mono text-sm text-muted-foreground">
                      {formatMAD(inv.vat)}
                    </TableCell>
                    <TableCell className="tnum text-right font-mono text-sm font-medium">
                      {formatMAD(inv.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
