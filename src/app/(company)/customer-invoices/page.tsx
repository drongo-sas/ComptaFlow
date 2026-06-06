"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { customerInvoices as seed, type CustomerInvoice } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";
import { InvoiceDetail } from "./invoice-detail";

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

type FilterKey = "all" | "draft" | "sent" | "paid" | "overdue";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "Toutes"     },
  { key: "draft",   label: "Brouillon"  },
  { key: "sent",    label: "Envoyées"   },
  { key: "paid",    label: "Encaissées" },
  { key: "overdue", label: "En retard"  },
];

const STATUS = {
  draft:   { label: "Brouillon", variant: "secondary"   as const, dot: "bg-muted-foreground" },
  sent:    { label: "Envoyée",   variant: "default"     as const, dot: "bg-primary"          },
  paid:    { label: "Payée",     variant: "success"     as const, dot: "bg-emerald-400"      },
  overdue: { label: "En retard", variant: "destructive" as const, dot: "bg-red-400"          },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function effectiveStatus(inv: CustomerInvoice): keyof typeof STATUS {
  if (inv.status === "sent" && inv.dueDate < TODAY) return "overdue";
  if (inv.status === "partial") return "sent";
  if (inv.status === "overdue") return "overdue";
  return inv.status as keyof typeof STATUS;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CustomerInvoicesPage() {
  const router = useRouter();
  const { setCollapsed } = useSidebar();
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(seed);
  const [selected, setSelected] = useState<CustomerInvoice | null>(null);
  const [filter, setFilter]     = useState<FilterKey>("all");

  useEffect(() => {
    setCollapsed(selected !== null);
    return () => setCollapsed(false);
  }, [selected, setCollapsed]);

  // ── KPI computations ──
  const totalFacture = useMemo(() => invoices.reduce((s, i) => s + i.total, 0), [invoices]);
  const encaisse     = useMemo(() => invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0), [invoices]);
  const enRetardCount = useMemo(() => invoices.filter((i) => effectiveStatus(i) === "overdue").length, [invoices]);

  // ── Filter counts ──
  const counts = useMemo(() => {
    const c = { all: invoices.length, draft: 0, sent: 0, paid: 0, overdue: 0 };
    invoices.forEach((inv) => {
      const st = effectiveStatus(inv);
      c[st]++;
    });
    return c;
  }, [invoices]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (filter === "all") return true;
      return effectiveStatus(inv) === filter;
    });
  }, [invoices, filter]);

  // ── Handlers ──
  function handleNewInvoice() {
    router.push("/customer-invoices/new");
  }


  // ── Filter tabs ──
  const filterTabs = (
    <div className="flex gap-1 overflow-x-auto">
      {FILTERS.map(({ key, label }) => {
        const count = counts[key] ?? 0;
        const active = filter === key;
        return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "min-w-[16px] rounded-full px-1 text-center text-[10px] font-semibold tabular-nums",
                  active
                    ? "bg-background/20 text-background"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <Topbar
        title="Factures clients"
        subtitle={`${invoices.length} factures · ${enRetardCount} en retard`}
      />

      {selected ? (
        /* ── SPLIT VIEW (existing invoice selected) ── */
        <div className="flex flex-1 overflow-hidden">

          {/* Left narrow list (340px) */}
          <div className="flex w-[340px] shrink-0 flex-col border-r bg-background">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-semibold text-muted-foreground">
                {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              </p>
              <Button size="sm" onClick={handleNewInvoice}>
                <Plus className="size-3.5" />
                Nouvelle
              </Button>
            </div>

            {/* Filter tabs */}
            <div className="overflow-x-auto border-b px-3 pb-2">
              {filterTabs}
            </div>

            {/* Invoice rows */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <FileText className="size-7 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Aucune facture</p>
                </div>
              ) : (
                filtered.map((inv) => {
                  const st  = effectiveStatus(inv);
                  const sc  = STATUS[st];
                  const sel = selected?.id === inv.id;
                  return (
                    <button
                      key={inv.id}
                      onClick={() => setSelected(inv)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors",
                        sel
                          ? "border-l-2 border-l-primary bg-primary/6"
                          : "border-l-2 border-l-transparent hover:bg-muted/50",
                      )}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {(inv.customer || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-semibold leading-tight">
                            {inv.customer || "Nouveau client"}
                          </p>
                          <p className="tnum shrink-0 font-mono text-sm font-semibold">
                            {formatMAD(inv.total)}
                          </p>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between">
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {inv.number} · {formatDate(inv.date)}
                          </p>
                          <span className={cn("size-1.5 shrink-0 rounded-full", sc.dot)} />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: read-only invoice detail */}
          <InvoiceDetail
            key={selected?.id}
            invoice={selected!}
            onClose={() => setSelected(null)}
            onEdit={() => router.push(`/customer-invoices/${selected!.id}/edit`)}
          />
        </div>
      ) : (
        /* ── FULL VIEW ── */
        <div className="flex-1 overflow-y-auto bg-paper">
          <div className="space-y-5 p-6">

            {/* KPI strip */}
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard
                label="Total facturé"
                value={formatMAD(totalFacture)}
                sub={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""}`}
              />
              <KpiCard
                label="Encaissé"
                value={formatMAD(encaisse)}
                sub="factures payées"
                tone="success"
              />
              <KpiCard
                label="En retard"
                value={String(enRetardCount)}
                sub={enRetardCount > 0 ? "échéances dépassées" : "Aucun retard"}
                tone={enRetardCount > 0 ? "danger" : "default"}
              />
            </div>

            {/* Toolbar: filter tabs + new invoice button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1">
                {filterTabs}
              </div>
              <Button size="sm" onClick={handleNewInvoice}>
                <Plus className="size-3.5" />
                Nouvelle facture
              </Button>
            </div>

            {/* Full table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CLIENT</TableHead>
                    <TableHead>N° FACTURE</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>ÉCHÉANCE</TableHead>
                    <TableHead className="text-right">MONTANT HT</TableHead>
                    <TableHead className="text-right">TVA</TableHead>
                    <TableHead className="text-right">TOTAL TTC</TableHead>
                    <TableHead>STATUT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="size-7 text-muted-foreground/30" />
                          <p className="text-sm">Aucune facture</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((inv) => {
                      const st = effectiveStatus(inv);
                      const sc = STATUS[st];
                      return (
                        <TableRow
                          key={inv.id}
                          className="cursor-pointer"
                          onClick={() => setSelected(inv)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                {(inv.customer || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{inv.customer || "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {inv.number}
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(inv.date)}</TableCell>
                          <TableCell
                            className={cn(
                              "text-sm",
                              st === "overdue" && "font-semibold text-destructive",
                            )}
                          >
                            {formatDate(inv.dueDate)}
                          </TableCell>
                          <TableCell className="tnum text-right font-mono text-sm text-muted-foreground">
                            {formatMAD(inv.amountHT)}
                          </TableCell>
                          <TableCell className="tnum text-right font-mono text-sm text-muted-foreground">
                            {formatMAD(inv.vat)}
                          </TableCell>
                          <TableCell className="tnum text-right font-mono text-sm font-semibold">
                            {formatMAD(inv.total)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "success" | "danger";
}) {
  const valueClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
        ? "text-destructive"
        : "text-foreground";

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("tnum mt-2 font-mono text-2xl font-semibold tracking-tight", valueClass)}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
