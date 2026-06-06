"use client";

import { useState } from "react";
import { Mail, Upload, FileInput, Copy, Check, Sparkles, ScanLine } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supplierInvoices as seed, type SupplierInvoice } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";
import { UploadInvoiceModal } from "./upload-modal";
import { InvoiceDrawer } from "./invoice-drawer";

const statusMap: Record<
  SupplierInvoice["status"],
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }
> = {
  draft:    { label: "À confirmer", variant: "warning"     },
  validated:{ label: "Validée",     variant: "default"     },
  paid:     { label: "Payée",       variant: "success"     },
  overdue:  { label: "En retard",   variant: "destructive" },
};

const sourceMap = {
  scan:   { label: "Scan",   icon: ScanLine },
  email:  { label: "Email",  icon: Mail     },
  upload: { label: "Import", icon: Upload   },
};

// Company email address for incoming invoices
const INVOICE_EMAIL = "factures@argandigital.comptaflow.ma";

// Simulated email invoice received
const EMAIL_SIMULATION: Omit<SupplierInvoice, "id"> = {
  supplier: "Lydec Casablanca",
  number: `LYD-${new Date().getFullYear()}-0087`,
  date: "2026-06-01",
  dueDate: "2026-06-30",
  amountHT: 2100,
  vat: 294,
  total: 2394,
  source: "email",
  status: "draft",
};

export default function SupplierInvoicesPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(seed);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SupplierInvoice | null>(null);

  const total = invoices.reduce((s, i) => s + i.total, 0);
  const toValidate = invoices.filter((i) => i.status === "draft").length;

  function handleAdd(inv: SupplierInvoice) {
    setInvoices((prev) => [inv, ...prev]);
  }

  function handleSave(id: string, patch: Partial<SupplierInvoice>) {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, ...patch } : inv));
    setSelectedInvoice((cur) => cur?.id === id ? { ...cur, ...patch } : cur);
  }

  function simulateEmailReceive() {
    const inv: SupplierInvoice = { ...EMAIL_SIMULATION, id: `s-email-${Date.now()}` };
    setInvoices((prev) => [inv, ...prev]);
  }

  function copyEmail() {
    navigator.clipboard.writeText(INVOICE_EMAIL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <>
      <Topbar title="Factures fournisseurs" subtitle="Scannées ou reçues par email" />

      <div className="bg-paper flex-1 space-y-4 p-6">
        {/* ── KPI strip ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStat label="Total du mois" value={formatMAD(total)} />
          <MiniStat label="À valider" value={`${toValidate}`} tone="warning" />
          <MiniStat label="Factures" value={`${invoices.length}`} />
        </div>

        {/* ── Email reception card ── */}
        <Card className="border-primary/15 bg-primary/3">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Réception automatique par email</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Demandez à vos fournisseurs d'envoyer leurs factures à cette adresse — elles seront lues et classées automatiquement.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <code className="rounded-md border bg-card px-2.5 py-1 font-mono text-xs">
                {INVOICE_EMAIL}
              </code>
              <button
                type="button"
                onClick={copyEmail}
                title="Copier l'adresse"
                className={cn(
                  "flex size-7 items-center justify-center rounded-md border transition-colors hover:bg-muted",
                  copied ? "text-success" : "text-muted-foreground"
                )}
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
              <Button size="sm" variant="outline" onClick={simulateEmailReceive}>
                <Sparkles className="size-3.5" />
                Simuler réception
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {invoices.length} facture{invoices.length > 1 ? "s" : ""} · l'IA extrait automatiquement les données à l'import.
          </p>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <FileInput className="size-4" />
            Ajouter une facture
          </Button>
        </div>

        {/* ── Table ── */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Fournisseur</TableHead>
                <TableHead>N° facture</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const s = statusMap[inv.status];
                const src = sourceMap[inv.source];
                const SrcIcon = src.icon;
                const isNew = inv.status === "draft";
                return (
                  <TableRow
                    key={inv.id}
                    className={cn("cursor-pointer hover:bg-muted/50", isNew && "bg-primary/[0.02]")}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {inv.supplier}
                        {isNew && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            <Sparkles className="size-2.5" />
                            IA
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{inv.number}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <SrcIcon className="size-3.5" />
                        {src.label}
                      </span>
                    </TableCell>
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

      {uploadOpen && (
        <UploadInvoiceModal
          onClose={() => setUploadOpen(false)}
          onAdd={handleAdd}
          source="upload"
        />
      )}

      <InvoiceDrawer
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onSave={handleSave}
      />
    </>
  );
}

function MiniStat({
  label, value, tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn(
          "tnum mt-1 font-mono text-xl font-semibold tracking-tight",
          tone === "warning" && "text-warning-foreground"
        )}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
