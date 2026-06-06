"use client";

import { useState, useMemo } from "react";
import {
  Plus, Search, Mail, Copy, Check, Sparkles, Upload, ScanLine,
  FileText, CheckCircle2, CreditCard, AlertCircle,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supplierInvoices as seed, type SupplierInvoice } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";
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
  const [invoices, setInvoices]       = useState<SupplierInvoice[]>(seed);
  const [selected, setSelected]       = useState<SupplierInvoice | null>(null);
  const [filter, setFilter]           = useState<FilterKey>("all");
  const [search, setSearch]           = useState("");
  const [uploadOpen, setUploadOpen]   = useState(false);
  const [copied, setCopied]           = useState(false);

  const counts = useMemo(() => {
    const c = { all: invoices.length, draft: 0, validated: 0, paid: 0, overdue: 0 };
    invoices.forEach((inv) => { c[effectiveStatus(inv)]++; });
    return c;
  }, [invoices]);

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

  return (
    <>
      <Topbar
        title="Factures fournisseurs"
        subtitle={`${invoices.length} factures · ${counts.draft} à confirmer`}
      />

      {/* ── Split layout ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Invoice list ── */}
        <div className="flex w-[320px] shrink-0 flex-col border-r bg-background">

          {/* List header */}
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
          <div className="flex gap-1 overflow-x-auto border-b px-3 pb-2">
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
                        active ? "bg-background/20 text-background" : "bg-muted-foreground/15 text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
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
                    {/* Avatar */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {inv.supplier.charAt(0)}
                    </div>

                    {/* Info */}
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

          {/* Email footer — compact */}
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

        {/* ── RIGHT: Invoice detail ── */}
        {selected ? (
          <InvoiceDetail
            key={selected.id}
            invoice={selected}
            onSave={handleSave}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-muted/10">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <FileText className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Sélectionnez une facture</p>
            <p className="text-xs text-muted-foreground/50">
              Cliquez sur une facture pour voir et modifier ses données
            </p>
          </div>
        )}
      </div>

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

// ── Invoice detail panel ──────────────────────────────────────────────────────

function InvoiceDetail({
  invoice,
  onSave,
}: {
  invoice: SupplierInvoice;
  onSave: (id: string, patch: Partial<SupplierInvoice>) => void;
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

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Detail header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-5 py-3.5">
        <div className="flex items-center gap-3">
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
            <Button size="sm" onClick={advance} className="gap-1.5">
              {st === "draft"
                ? <CheckCircle2 className="size-3.5" />
                : <CreditCard className="size-3.5" />
              }
              {advanceLabel}
            </Button>
          )}
          <Button
            size="sm"
            variant={saved ? "outline" : "outline"}
            onClick={handleSave}
            className={cn(saved && "border-success text-success")}
          >
            {saved ? <><Check className="size-3.5" /> Sauvegardé</> : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Body — side by side */}
      <div className="flex flex-1 overflow-hidden">

        {/* Document card */}
        <div className="flex w-[42%] shrink-0 flex-col gap-3 overflow-y-auto border-r bg-muted/10 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Document
          </p>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            {/* Supplier row */}
            <div className="mb-4 flex items-center gap-2.5 border-b pb-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                {fields.supplier.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-sm">{fields.supplier}</p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <SrcIcon className="size-3" />
                  <span>{srcLabel}</span>
                </div>
              </div>
            </div>

            {/* Meta grid */}
            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <MetaRow label="N° Facture" value={fields.number} mono />
              <MetaRow label="Date" value={formatDate(fields.date)} />
              <MetaRow
                label="Échéance"
                value={formatDate(fields.dueDate)}
                className={st === "overdue" ? "text-destructive font-semibold" : ""}
              />
              <MetaRow
                label="TVA"
                value={fields.vatRate === "exempt" ? "Exonéré" : `${fields.vatRate ?? "20"}%`}
              />
            </div>

            {/* Amounts */}
            <div className="space-y-1.5 rounded-lg bg-muted/50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant HT</span>
                <span className="tnum font-mono font-medium">{formatMAD(fields.amountHT)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA</span>
                <span className="tnum font-mono text-muted-foreground">{formatMAD(fields.vat)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5">
                <span className="font-semibold">Total TTC</span>
                <span className="tnum font-mono font-bold">{formatMAD(fields.total)}</span>
              </div>
            </div>

            {/* Stamp */}
            {(st === "paid" || st === "overdue") && (
              <div className="mt-4 flex justify-center">
                <span className={cn(
                  "rotate-[-8deg] rounded border-2 px-3 py-1 text-[11px] font-bold uppercase tracking-widest opacity-50",
                  st === "paid"    ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600",
                )}>
                  {st === "paid" ? "Payée" : "En retard"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Editable form */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Modifier la facture
          </p>

          <div className="space-y-3 max-w-sm">
            <FormField
              label="Fournisseur"
              value={fields.supplier}
              onChange={(v) => set("supplier", v)}
            />
            <FormField
              label="N° Facture"
              value={fields.number}
              onChange={(v) => set("number", v)}
              mono
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Date facture"
                value={fields.date}
                onChange={(v) => set("date", v)}
                type="date"
              />
              <FormField
                label="Échéance"
                value={fields.dueDate}
                onChange={(v) => set("dueDate", v)}
                type="date"
              />
            </div>

            {/* Amounts block */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Montants</p>
              <div className="grid grid-cols-2 gap-3">
                <FormNumberField
                  label="Montant HT"
                  value={fields.amountHT}
                  onChange={(v) => set("amountHT", v)}
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Taux TVA</label>
                  <select
                    value={fields.vatRate ?? "20"}
                    onChange={(e) => set("vatRate", e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {VAT_RATES.map((r) => (
                      <option key={r} value={r}>
                        {r === "exempt" ? "Exonéré" : `${r}%`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <FormNumberField
                  label="TVA"
                  value={fields.vat}
                  onChange={(v) => set("vat", v)}
                  muted
                />
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Total TTC</p>
                  <p className="tnum font-mono text-xl font-bold leading-9">
                    {formatMAD(fields.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status selector — overdue is never a manual choice */}
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
                  Échéance dépassée — marquée automatiquement "En retard"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small display helpers ─────────────────────────────────────────────────────

function MetaRow({
  label, value, mono, className,
}: {
  label: string; value: string; mono?: boolean; className?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-xs font-semibold", mono && "font-mono", className)}>
        {value}
      </p>
    </div>
  );
}

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
