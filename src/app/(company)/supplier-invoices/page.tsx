"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, Mail, Copy, Check, Sparkles, Upload, ScanLine,
  FileText, CheckCircle2, CreditCard, AlertCircle, X,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supplierInvoices as seed, type SupplierInvoice } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";
import { UploadInvoiceModal } from "./upload-modal";

// ── Constants ─────────────────────────────────────────────────────────────────

const INVOICE_EMAIL = "factures@argandigital.comptaflow.ma";

const EMAIL_SIM: Omit<SupplierInvoice, "id"> = {
  supplier: "Lydec Casablanca",
  number:   `LYD-${new Date().getFullYear()}-0087`,
  date:     "2026-06-01",
  dueDate:  "2026-06-30",
  amountHT: 2100,
  vat:      294,
  total:    2394,
  source:   "email",
  status:   "draft",
};

const SOURCE_LABELS = {
  scan:   { label: "Scan",   Icon: ScanLine },
  email:  { label: "Email",  Icon: Mail     },
  upload: { label: "Import", Icon: Upload   },
};

type FilterKey = "all" | "draft" | "validated" | "paid" | "overdue";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "Toutes"      },
  { key: "draft",     label: "À confirmer" },
  { key: "validated", label: "Validées"    },
  { key: "paid",      label: "Payées"      },
  { key: "overdue",   label: "En retard"   },
];

const STATUS = {
  draft:     { label: "À confirmer", variant: "warning"     as const, dot: "bg-amber-400"    },
  validated: { label: "Validée",     variant: "default"     as const, dot: "bg-primary"      },
  paid:      { label: "Payée",       variant: "success"     as const, dot: "bg-emerald-400"  },
  overdue:   { label: "En retard",   variant: "destructive" as const, dot: "bg-red-400"      },
};

const VAT_RATES = ["20", "14", "10", "7", "0", "exempt"] as const;

const TODAY = new Date().toISOString().split("T")[0];

// ── Helpers ───────────────────────────────────────────────────────────────────

function effectiveStatus(inv: SupplierInvoice): SupplierInvoice["status"] {
  if (inv.status === "validated" && inv.dueDate < TODAY) return "overdue";
  return inv.status;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SupplierInvoicesPage() {
  const { setCollapsed } = useSidebar();
  const [invoices, setInvoices]     = useState<SupplierInvoice[]>(seed);
  const [selected, setSelected]     = useState<SupplierInvoice | null>(null);
  const [filter, setFilter]         = useState<FilterKey>("all");
  const [search, setSearch]         = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    setCollapsed(selected !== null);
    return () => setCollapsed(false);
  }, [selected, setCollapsed]);

  const counts = useMemo(() => {
    const c = { all: invoices.length, draft: 0, validated: 0, paid: 0, overdue: 0 };
    invoices.forEach((inv) => { c[effectiveStatus(inv)]++; });
    return c;
  }, [invoices]);

  const totalDuMois = useMemo(
    () => invoices.reduce((s, inv) => s + inv.total, 0),
    [invoices],
  );

  const filtered = useMemo(
    () =>
      invoices.filter((inv) => {
        const matchFilter = filter === "all" || effectiveStatus(inv) === filter;
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          inv.supplier.toLowerCase().includes(q) ||
          inv.number.toLowerCase().includes(q);
        return matchFilter && matchSearch;
      }),
    [invoices, filter, search],
  );

  function handleAdd(inv: SupplierInvoice) {
    setInvoices((p) => [inv, ...p]);
    setSelected(inv);
  }

  function handleSave(id: string, patch: Partial<SupplierInvoice>) {
    setInvoices((p) => p.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)));
    setSelected((cur) => (cur?.id === id ? { ...cur, ...patch } : cur));
  }

  function simulateEmail() {
    const inv: SupplierInvoice = { ...EMAIL_SIM, id: `s-email-${Date.now()}` };
    setInvoices((p) => [inv, ...p]);
    setSelected(inv);
  }

  function copyEmail() {
    navigator.clipboard.writeText(INVOICE_EMAIL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  // Shared filter tabs component (used in both views)
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
        title="Factures fournisseurs"
        subtitle={`${invoices.length} factures · ${counts.draft} à confirmer`}
      />

      {selected ? (
        /* ── SPLIT VIEW: row clicked → narrow list + detail panel ── */
        <div className="flex flex-1 overflow-hidden">

          {/* Left: narrow list (320 px) */}
          <div className="flex w-[360px] shrink-0 flex-col border-r bg-background">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-semibold text-muted-foreground">
                {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              </p>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Plus className="size-3.5" />
                Ajouter
              </Button>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Fournisseur, n° facture…"
                  className="h-8 w-full rounded-md border bg-muted/50 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
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
                        {inv.supplier.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-semibold leading-tight">{inv.supplier}</p>
                          <p className="tnum shrink-0 font-mono text-sm font-semibold">{formatMAD(inv.total)}</p>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between">
                          <p className="font-mono text-[11px] text-muted-foreground">{inv.number}</p>
                          <span className={cn("size-1.5 shrink-0 rounded-full", sc.dot)} />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Email strip (compact, inside narrow list) */}
            <div className="shrink-0 border-t p-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 py-2">
                <Mail className="size-3 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground">
                  {INVOICE_EMAIL}
                </p>
                <button
                  onClick={copyEmail}
                  className={cn("transition-colors", copied ? "text-success" : "text-muted-foreground hover:text-foreground")}
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                </button>
                <button
                  onClick={simulateEmail}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
                >
                  <Sparkles className="size-2.5" />
                  Simuler
                </button>
              </div>
            </div>
          </div>

          {/* Right: Invoice detail */}
          <InvoiceDetail
            key={selected.id}
            invoice={selected}
            onSave={handleSave}
            onClose={() => setSelected(null)}
          />
        </div>
      ) : (
        /* ── FULL VIEW: nothing selected → KPIs + email card + full table ── */
        <div className="flex-1 overflow-y-auto bg-paper">
          <div className="space-y-5 p-6">

            {/* KPI strip */}
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard
                label="Total du mois"
                value={formatMAD(totalDuMois)}
                sub={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""}`}
              />
              <KpiCard
                label="À valider"
                value={String(counts.draft)}
                sub="factures en attente"
                tone="warning"
              />
              <KpiCard
                label="En retard"
                value={String(counts.overdue)}
                sub={counts.overdue > 0 ? "échéances dépassées" : "Aucun retard"}
                tone={counts.overdue > 0 ? "danger" : "default"}
              />
            </div>

            {/* Email reception card */}
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Mail className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Réception par email</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Transmettez vos factures fournisseurs à cette adresse — elles seront
                        automatiquement importées et analysées par l&apos;IA.
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                          {INVOICE_EMAIL}
                        </code>
                        <button
                          onClick={copyEmail}
                          className={cn(
                            "flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors",
                            copied
                              ? "text-success"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {copied ? (
                            <><Check className="size-3" /> Copié</>
                          ) : (
                            <><Copy className="size-3" /> Copier</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={simulateEmail}
                  >
                    <Sparkles className="size-3.5" />
                    Simuler réception
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Toolbar: search + filters + add */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Fournisseur, n° facture…"
                  className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1">
                {filterTabs}
              </div>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Plus className="size-3.5" />
                Ajouter
              </Button>
            </div>

            {/* Full table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead className="text-right">TVA</TableHead>
                    <TableHead className="text-right">Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
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
                      const { Icon: SrcIcon, label: srcLabel } = SOURCE_LABELS[inv.source];
                      return (
                        <TableRow
                          key={inv.id}
                          className="cursor-pointer"
                          onClick={() => setSelected(inv)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                {inv.supplier.charAt(0)}
                              </div>
                              <span className="font-medium">{inv.supplier}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {inv.number}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <SrcIcon className="size-3.5" />
                              {srcLabel}
                            </span>
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

      {uploadOpen && (
        <UploadInvoiceModal
          onClose={() => setUploadOpen(false)}
          onAdd={handleAdd}
          source="upload"
        />
      )}
    </>
  );
}

// ── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning" | "danger";
}) {
  const valueClass =
    tone === "warning"
      ? "text-warning-foreground"
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

// ── Invoice detail panel ──────────────────────────────────────────────────────

function InvoiceDetail({
  invoice,
  onSave,
  onClose,
}: {
  invoice: SupplierInvoice;
  onSave: (id: string, patch: Partial<SupplierInvoice>) => void;
  onClose: () => void;
}) {
  const [fields, setFields] = useState({ ...invoice });
  const [saved,  setSaved]  = useState(false);

  const st = effectiveStatus(fields);
  const sc = STATUS[st];
  const { Icon: SrcIcon, label: srcLabel } = SOURCE_LABELS[fields.source];

  function set<K extends keyof SupplierInvoice>(key: K, value: SupplierInvoice[K]) {
    setFields((f) => {
      const next = { ...f, [key]: value };
      if (key === "amountHT") {
        const rate = f.vatRate && f.vatRate !== "exempt" ? parseFloat(f.vatRate) / 100 : 0;
        next.vat   = Math.round((value as number) * rate * 100) / 100;
        next.total = Math.round(((value as number) + next.vat) * 100) / 100;
      }
      if (key === "vatRate") {
        const rate = (value as string) !== "exempt" ? parseFloat(value as string) / 100 : 0;
        next.vat   = Math.round(f.amountHT * rate * 100) / 100;
        next.total = Math.round((f.amountHT + next.vat) * 100) / 100;
      }
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    onSave(fields.id, fields);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function advance() {
    const next =
      st === "draft"     ? "validated" :
      st === "validated" ? "paid"      :
      st === "overdue"   ? "paid"      : null;
    if (!next) return;
    const status = next as SupplierInvoice["status"];
    setFields((f) => ({ ...f, status }));
    onSave(fields.id, { status });
  }

  const advanceLabel =
    st === "draft"     ? "Confirmer"      :
    st === "validated" ? "Marquer payée"  :
    st === "overdue"   ? "Marquer payée"  : null;

  const iframeSrc = fields.fileUrl
    ? fields.fileUrl.startsWith("blob:")
      ? fields.fileUrl
      : `/api/pdf-proxy?url=${encodeURIComponent(fields.fileUrl)}`
    : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            title="Fermer"
          >
            <X className="size-4" />
          </button>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {fields.supplier.charAt(0)}
          </div>
          <div>
            <p className="font-semibold leading-tight">{fields.supplier}</p>
            <p className="font-mono text-xs text-muted-foreground">{fields.number}</p>
          </div>
          <Badge variant={sc.variant}>{sc.label}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {advanceLabel && (
            <Button size="sm" onClick={advance}>
              {st === "draft" ? <CheckCircle2 className="size-3.5" /> : <CreditCard className="size-3.5" />}
              {advanceLabel}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            className={cn(saved && "border-success text-success")}
          >
            {saved ? <><Check className="size-3.5" />Sauvegardé</> : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* ── TOP: form fields, max 2 per row ── */}
      <div className="shrink-0 border-b bg-background px-5 py-4">
        <div className="grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3">

          <FormField label="Fournisseur" value={fields.supplier} onChange={(v) => set("supplier", v)} />
          <FormField label="N° Facture"  value={fields.number}   onChange={(v) => set("number", v)} mono />

          <FormField label="Date facture" value={fields.date}    onChange={(v) => set("date", v)}    type="date" />
          <FormField label="Échéance"     value={fields.dueDate} onChange={(v) => set("dueDate", v)} type="date" />

          <FormNumberField label="Montant HT" value={fields.amountHT} onChange={(v) => set("amountHT", v)} />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Taux TVA</label>
            <select
              value={fields.vatRate ?? "20"}
              onChange={(e) => set("vatRate", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {VAT_RATES.map((r) => (
                <option key={r} value={r}>{r === "exempt" ? "Exonéré" : `${r}%`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">TVA</p>
              <p className="tnum mt-1.5 font-mono text-sm text-muted-foreground">{formatMAD(fields.vat)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total TTC</p>
              <p className="tnum mt-1 font-mono text-xl font-bold">{formatMAD(fields.total)}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Statut</label>
            <select
              value={fields.status}
              onChange={(e) => set("status", e.target.value as SupplierInvoice["status"])}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="draft">À confirmer</option>
              <option value="validated">Validée</option>
              <option value="paid">Payée</option>
            </select>
            {st === "overdue" && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3 shrink-0" />
                Échéance dépassée — &quot;En retard&quot; automatique
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: document viewer ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-muted/10">
        <div className="flex shrink-0 items-center justify-between bg-background px-5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {fields.fileUrl ? "Document original" : "Aperçu"}
          </p>
          {fields.fileUrl && (
            <a
              href={fields.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-medium text-primary hover:underline"
            >
              Ouvrir ↗
            </a>
          )}
        </div>

        {iframeSrc && (
          <div className="flex flex-1 items-start justify-center overflow-hidden p-5">
            <div className="h-full w-full max-w-2xl rounded-xl border shadow-sm overflow-hidden bg-white">
              {fields.fileType === "image" ? (
                <div className="h-full overflow-y-auto">
                  <img src={iframeSrc} alt="Facture" className="w-full object-contain" />
                </div>
              ) : (
                <iframe src={iframeSrc} title="Aperçu facture" className="h-full w-full border-0" />
              )}
            </div>
          </div>
        )}

        {!iframeSrc && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-lg rounded-xl border bg-white shadow-sm overflow-hidden text-[12px]">
              <div className="border-b px-6 pt-6 pb-4">
                <p className="text-3xl font-black tracking-tight">Facture</p>
                <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-[11px]">
                  <div className="flex gap-2"><span className="w-20 shrink-0 font-medium">N° Facture</span><span className="font-mono">{fields.number}</span></div>
                  <div className="flex gap-2"><span className="w-20 shrink-0 font-medium">Date</span><span>{formatDate(fields.date)}</span></div>
                  <div className="flex gap-2">
                    <span className={cn("w-20 shrink-0 font-medium", st === "overdue" && "text-destructive")}>Échéance</span>
                    <span className={cn(st === "overdue" && "font-semibold text-destructive")}>{formatDate(fields.dueDate)}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-b px-6 py-4 text-[11px]">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">De</p>
                  <p className="font-bold">Argan Digital SARL</p>
                  <p className="text-muted-foreground">Casablanca, Maroc</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Fournisseur</p>
                  <p className="font-bold">{fields.supplier}</p>
                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                    <SrcIcon className="size-3" /><span>{srcLabel}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 px-6 py-4 text-[11px]">
                <div className="flex justify-between text-muted-foreground"><span>Montant HT</span><span className="tnum font-mono">{formatMAD(fields.amountHT)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>TVA {fields.vatRate === "exempt" ? "(exonéré)" : `${fields.vatRate ?? "20"}%`}</span><span className="tnum font-mono">{formatMAD(fields.vat)}</span></div>
                <div className="flex justify-between border-t pt-2 font-bold"><span>Total TTC</span><span className="tnum font-mono">{formatMAD(fields.total)}</span></div>
              </div>
              {(st === "paid" || st === "overdue") && (
                <div className="flex justify-center border-t px-6 py-4">
                  <span className={cn("rotate-[-8deg] rounded border-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest opacity-50",
                    st === "paid" ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600")}>
                    {st === "paid" ? "Payée" : "En retard"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small form helpers ────────────────────────────────────────────────────────

function FormField({
  label, value, onChange, type = "text", mono,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; mono?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
          mono && "font-mono",
        )}
      />
    </div>
  );
}

function FormNumberField({
  label, value, onChange, muted,
}: {
  label: string; value: number; onChange: (v: number) => void; muted?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={cn(
          "tnum h-9 w-full rounded-md border border-input bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring",
          muted && "text-muted-foreground",
        )}
      />
    </div>
  );
}
