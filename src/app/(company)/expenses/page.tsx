import { ReceiptText, Paperclip, AlertCircle } from "lucide-react";
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
import { expenses, type Expense } from "@/lib/mock-data";
import { formatMAD, formatDate } from "@/lib/utils";

const statusMap: Record<
  Expense["status"],
  { label: string; variant: "secondary" | "success" | "destructive" }
> = {
  to_review: { label: "À examiner", variant: "secondary" },
  approved: { label: "Approuvée", variant: "success" },
  rejected: { label: "Rejetée", variant: "destructive" },
};

export default function ExpensesPage() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const missingReceipts = expenses.filter((e) => !e.hasReceipt).length;

  return (
    <>
      <Topbar title="Dépenses" subtitle="Notes de frais & petites dépenses" />
      <div className="bg-paper flex-1 space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total du mois</p>
              <p className="tnum mt-1 font-mono text-xl font-semibold">{formatMAD(total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Sans justificatif</p>
              <p className="tnum mt-1 font-mono text-xl font-semibold text-warning-foreground">
                {missingReceipts}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Dépenses</p>
              <p className="tnum mt-1 font-mono text-xl font-semibold">{expenses.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button size="sm">
            <ReceiptText className="size-4" />
            Nouvelle dépense
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Dépense</TableHead>
                <TableHead>Collaborateur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Justificatif</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => {
                const s = statusMap[e.status];
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.employee}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.category}</TableCell>
                    <TableCell className="tnum whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {formatDate(e.date)}
                    </TableCell>
                    <TableCell>
                      {e.hasReceipt ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Paperclip className="size-3.5" />
                          Joint
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-warning-foreground">
                          <AlertCircle className="size-3.5" />
                          Manquant
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="tnum text-right font-mono text-sm font-medium">
                      {formatMAD(e.amount)}
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
