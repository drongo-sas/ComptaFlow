"use client";

import { useEffect, useState } from "react";
import { X, FileText, CheckCircle2, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatMAD, formatDate } from "@/lib/utils";
import type { SupplierInvoice } from "@/lib/mock-data";

interface Props {
  invoice: SupplierInvoice | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<SupplierInvoice>) => void;
}

const statusConfig = {
  draft:     { label: "À confirmer", variant: "warning"     as const },
  validated: { label: "Validée",     variant: "default"     as const },
  paid:      { label: "Payée",       variant: "success"     as const },
  overdue:   { label: "En retard",   variant: "destructive" as const },
};

const VAT_RATES = ["20", "14", "10", "7", "0", "exempt"] as const;

export function InvoiceDrawer({ invoice, onClose, onSave }: Props) {
  const [fields, setFields] = useState<SupplierInvoice | null>(null);

  // Reset local state when invoice changes
  useEffect(() => {
    setFields(invoice ? { ...invoice } : null);
  }, [invoice?.id]);

  if (!invoice || !fields) return null;

  function set<K extends keyof SupplierInvoice>(key: K, value: SupplierInvoice[K]) {
    setFields((f) => {
      if (!f) return f;
      const next = { ...f, [key]: value };
      // Recompute vat + total when amountHT or source vatRate changes
      if (key === "amountHT") {
        const vatRate = f.vatRate as string | undefined;
        const rate = vatRate && vatRate !== "exempt" ? parseFloat(vatRate) / 100 : 0;
        next.vat = Math.round((value as number) * rate * 100) / 100;
        next.total = Math.round(((value as number) + next.vat) * 100) / 100;
      }
      return next;
    });
  }

  function handleSave() {
    if (!fields) return;
    onSave(fields.id, fields);
    onClose();
  }

  function advance() {
    if (!fields) return;
    const next =
      fields.status === "draft"     ? "validated" :
      fields.status === "validated" ? "paid" :
      fields.status === "overdue"   ? "paid" : null;
    if (next) {
      const status = next as SupplierInvoice["status"];
      setFields({ ...fields, status });
      onSave(fields.id, { status });
    }
  }

  const advanceLabel = !fields ? null :
    fields.status === "draft"     ? "Confirmer la facture" :
    fields.status === "validated" ? "Marquer comme payée" :
    fields.status === "overdue"   ? "Marquer comme payée" : null;

  const sc = statusConfig[fields.status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col border-l bg-background shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold leading-tight">{invoice.supplier}</p>
              <p className="font-mono text-xs text-muted-foreground">{invoice.number}</p>
            </div>
            <Badge variant={sc.variant}>{sc.label}</Badge>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left: Document preview ── */}
          <div className="flex w-[45%] shrink-0 flex-col gap-3 overflow-y-auto border-r bg-muted/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Document
            </p>

            {/* Mock invoice paper */}
            <div className="rounded-xl border bg-white p-5 shadow-sm text-[13px]">
              {/* Supplier header */}
              <div className="mb-4 border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 font-bold text-primary text-sm">
                    {invoice.supplier.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{invoice.supplier}</p>
                    <p className="text-[11px] text-muted-foreground">Fournisseur</p>
                  </div>
                </div>
              </div>

              {/* Invoice meta */}
              <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">N° Facture</p>
                  <p className="font-mono font-semibold">{invoice.number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-semibold">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Échéance</p>
                  <p className={cn(
                    "font-semibold",
                    invoice.status === "overdue" && "text-destructive"
                  )}>
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-semibold capitalize">{invoice.source}</p>
                </div>
              </div>

              {/* Amount breakdown */}
              <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant HT</span>
                  <span className="tnum font-mono font-medium">{formatMAD(invoice.amountHT)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA</span>
                  <span className="tnum font-mono text-muted-foreground">{formatMAD(invoice.vat)}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="font-semibold">Total TTC</span>
                  <span className="tnum font-mono font-bold text-foreground">{formatMAD(invoice.total)}</span>
                </div>
              </div>

              {/* Status stamp */}
              {invoice.status === "paid" && (
                <div className="mt-4 flex items-center justify-center">
                  <span className="rotate-[-8deg] rounded border-2 border-success px-3 py-1 text-xs font-bold uppercase tracking-widest text-success opacity-60">
                    Payée
                  </span>
                </div>
              )}
              {invoice.status === "overdue" && (
                <div className="mt-4 flex items-center justify-center">
                  <span className="rotate-[-8deg] rounded border-2 border-destructive px-3 py-1 text-xs font-bold uppercase tracking-widest text-destructive opacity-60">
                    En retard
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Editable fields ── */}
          <div className="flex flex-1 flex-col overflow-y-auto p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Données de la facture
            </p>

            <div className="space-y-4">
              <Field
                label="Fournisseur"
                value={fields.supplier}
                onChange={(v) => set("supplier", v)}
              />
              <Field
                label="N° Facture"
                value={fields.number}
                onChange={(v) => set("number", v)}
                mono
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Date facture"
                  value={fields.date}
                  onChange={(v) => set("date", v)}
                  type="date"
                />
                <Field
                  label="Date échéance"
                  value={fields.dueDate}
                  onChange={(v) => set("dueDate", v)}
                  type="date"
                />
              </div>

              {/* Amounts */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Montants</p>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="Montant HT"
                    value={fields.amountHT}
                    onChange={(v) => set("amountHT", v)}
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Taux TVA</label>
                    <select
                      value={(fields as SupplierInvoice & { vatRate?: string }).vatRate ?? "20"}
                      onChange={(e) => set("vatRate" as keyof SupplierInvoice, e.target.value as never)}
                      className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {VAT_RATES.map((r) => (
                        <option key={r} value={r}>
                          {r === "exempt" ? "Exonéré" : `${r}%`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField
                    label="TVA"
                    value={fields.vat}
                    onChange={(v) => set("vat", v)}
                    muted
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total TTC</p>
                    <p className="tnum pt-1.5 font-mono text-lg font-bold">
                      {formatMAD(fields.total)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Statut</label>
                <select
                  value={fields.status}
                  onChange={(e) => set("status", e.target.value as SupplierInvoice["status"])}
                  className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="draft">À confirmer</option>
                  <option value="validated">Validée</option>
                  <option value="paid">Payée</option>
                  <option value="overdue">En retard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t bg-card px-6 py-4">
          {advanceLabel ? (
            <Button size="sm" onClick={advance}>
              {fields.status === "draft"
                ? <CheckCircle2 className="size-4" />
                : <CreditCard className="size-4" />}
              {advanceLabel}
              <ChevronRight className="size-3.5" />
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Annuler</Button>
            <Button variant="outline" size="sm" onClick={handleSave}>Sauvegarder</Button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", mono, className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          mono && "font-mono"
        )}
      />
    </div>
  );
}

function NumberField({
  label, value, onChange, muted,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  muted?: boolean;
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
          "tnum h-9 w-full rounded-md border border-input bg-card px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          muted && "text-muted-foreground"
        )}
      />
    </div>
  );
}
