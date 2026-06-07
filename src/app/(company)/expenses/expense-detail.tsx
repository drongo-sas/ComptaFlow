"use client";

import { useState, useEffect, useRef } from "react";
import { X, Edit2, Check, Upload, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Expense, type TxCategory, CATEGORY_LABELS } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";

// ── Constants ─────────────────────────────────────────────────────────────────

interface Props {
  expense: Expense;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Expense>) => void;
  onValidate: () => void;
  onReject: () => void;
  onReimburse: () => void;
}

const STATUS = {
  pending:    { label: "En attente",  variant: "secondary"   as const },
  validated:  { label: "Validée",     variant: "default"     as const },
  reimbursed: { label: "Remboursée",  variant: "success"     as const },
  rejected:   { label: "Rejetée",     variant: "destructive" as const },
};

const PAID_BY_LABELS: Record<Expense["paidBy"], string> = {
  company_card: "Carte entreprise",
  employee:     "Avance employé",
  cash:         "Espèces",
};

const EXPENSE_CATEGORIES: TxCategory[] = [
  "meals", "transport", "supplies", "software", "telecom",
  "marketing", "utilities", "rent", "other",
];

type VatRateOpt = Expense["vatRate"];

const VAT_OPTIONS: { value: VatRateOpt; label: string }[] = [
  { value: "20", label: "20 %" }, { value: "14", label: "14 %" },
  { value: "10", label: "10 %" }, { value: "7",  label: "7 %"  },
  { value: "0",  label: "0 %"  }, { value: "exempt", label: "Exonéré" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function ExpenseDetail({
  expense, onClose, onSave, onValidate, onReject, onReimburse,
}: Props) {
  const [editing,    setEditing]    = useState(false);
  const [fields,     setFields]     = useState<Expense>({ ...expense });
  const [saved,      setSaved]      = useState(false);
  const [receiptSrc, setReceiptSrc] = useState<string | null>(expense.receiptUrl ?? null);
  const [receiptExt, setReceiptExt] = useState<"image" | "pdf">(expense.receiptType ?? "image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFields({ ...expense });
    setEditing(false);
    setSaved(false);
    setReceiptSrc(expense.receiptUrl ?? null);
    setReceiptExt(expense.receiptType ?? "image");
  }, [expense.id]);

  const sc       = STATUS[expense.status];
  const canEdit  = expense.status === "pending" || expense.status === "validated";

  const ht  = fields.amountHT;
  const vat = fields.vatRate === "exempt" || fields.vatRate === "0"
    ? 0 : ht * parseFloat(fields.vatRate) / 100;
  const ttc = ht + vat;

  function setField<K extends keyof Expense>(key: K, value: Expense[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    onSave(expense.id, { ...fields, vat, total: ttc });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const ext: "image" | "pdf" = file.type === "application/pdf" ? "pdf" : "image";
    setReceiptSrc(url);
    setReceiptExt(ext);
    onSave(expense.id, { receiptUrl: url, receiptType: ext });
  }

  const inputCls = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "mb-1.5 block text-xs font-medium text-muted-foreground";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted" title="Fermer">
            <X className="size-4" />
          </button>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {CATEGORY_LABELS[expense.category].charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">
              {editing ? (fields.description || "…") : expense.description}
            </p>
            <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[expense.category]}</p>
          </div>
          <Badge variant={sc.variant}>{sc.label}</Badge>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Check className="size-3.5" />Sauvegarder
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setFields({ ...expense }); setEditing(false); }}>
                Annuler
              </Button>
            </>
          ) : (
            <>
              {saved && <span className="text-xs font-medium text-emerald-600">Sauvegardé</span>}
              {canEdit && (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Edit2 className="size-3.5" />Modifier
                </Button>
              )}
              {expense.status === "pending" && (
                <>
                  <Button size="sm" onClick={onValidate}>Valider</Button>
                  <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={onReject}>
                    Rejeter
                  </Button>
                </>
              )}
              {expense.status === "validated" && expense.paidBy === "employee" && (
                <Button size="sm" onClick={onReimburse}>Rembourser</Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── TOP: form / info fields ── */}
      <div className="shrink-0 border-b bg-background px-5 py-4">
        {editing ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <input type="text" value={fields.description} onChange={(e) => setField("description", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" value={fields.date} onChange={(e) => setField("date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Catégorie</label>
              <select value={fields.category} onChange={(e) => setField("category", e.target.value as TxCategory)} className={cn(inputCls, "cursor-pointer")}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Montant HT (MAD)</label>
              <input type="number" min="0" step="0.01" value={fields.amountHT} onChange={(e) => setField("amountHT", parseFloat(e.target.value) || 0)} className={cn(inputCls, "font-mono")} />
            </div>
            <div>
              <label className={labelCls}>Taux TVA</label>
              <select value={fields.vatRate} onChange={(e) => setField("vatRate", e.target.value as VatRateOpt)} className={cn(inputCls, "cursor-pointer")}>
                {VAT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Payé par</label>
              <select value={fields.paidBy} onChange={(e) => setField("paidBy", e.target.value as Expense["paidBy"])} className={cn(inputCls, "cursor-pointer")}>
                <option value="company_card">Carte entreprise</option>
                <option value="employee">Avance employé</option>
                <option value="cash">Espèces</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Soumis par</label>
              <input type="text" value={fields.submittedBy} onChange={(e) => setField("submittedBy", e.target.value)} className={inputCls} />
            </div>
            {/* Live totals */}
            <div className="col-span-2 flex items-center gap-6 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">TVA&nbsp;<span className="font-mono">{formatMAD(vat)}</span></span>
              <span className="font-bold">Total TTC&nbsp;<span className="font-mono">{formatMAD(ttc)}</span></span>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Notes</label>
              <textarea value={fields.notes ?? ""} onChange={(e) => setField("notes", e.target.value)} rows={2} className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground self-center">Date</span>
              <span className="font-medium">{formatDate(expense.date)}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground self-center">Catégorie</span>
              <span className="font-medium">{CATEGORY_LABELS[expense.category]}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground self-center">Payé par</span>
              <span className="font-medium">{PAID_BY_LABELS[expense.paidBy]}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground self-center">Soumis par</span>
              <span className="font-medium">{expense.submittedBy}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground self-center">Montant HT</span>
              <span className="font-mono font-medium">{formatMAD(expense.amountHT)}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground self-center">
                TVA {expense.vatRate === "exempt" ? "" : `(${expense.vatRate}%)`}
              </span>
              <span className="font-mono font-medium">{formatMAD(expense.vat)}</span>
            </div>
            <div className="col-span-2 flex gap-2 border-t pt-2">
              <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground self-center">Total TTC</span>
              <span className="font-mono text-base font-bold">{formatMAD(expense.total)}</span>
            </div>
            {expense.notes && (
              <div className="col-span-2 flex gap-2">
                <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">Notes</span>
                <span className="text-muted-foreground">{expense.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM: justificatif viewer ── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-muted/10">

        {/* Section label + actions */}
        <div className="flex shrink-0 items-center justify-between bg-background px-5 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {receiptSrc ? "Justificatif" : "Aperçu"}
          </p>
          <div className="flex items-center gap-2">
            {receiptSrc && (
              <a href={receiptSrc} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-primary hover:underline">
                Ouvrir ↗
              </a>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Upload className="size-3" />
              {receiptSrc ? "Remplacer" : "Ajouter"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {receiptSrc ? (
            /* ── Actual uploaded file ── */
            <div className="mx-auto h-full max-w-lg overflow-hidden rounded-xl border bg-white shadow-sm">
              {receiptExt === "image" ? (
                <div className="h-full overflow-y-auto">
                  <img src={receiptSrc} alt="Justificatif" className="w-full object-contain" />
                </div>
              ) : (
                <iframe src={receiptSrc} title="Justificatif" className="h-full w-full border-0" />
              )}
            </div>
          ) : (
            /* ── Styled receipt card (no file) ── */
            <div className="mx-auto max-w-xs overflow-hidden rounded-xl border bg-white shadow-sm">
              {/* Receipt header */}
              <div className="border-b px-6 py-5 text-center">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
                  <ImageIcon className="size-5 text-muted-foreground/50" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reçu</p>
                <p className="mt-1 text-sm font-bold">{CATEGORY_LABELS[expense.category]}</p>
              </div>

              {/* Receipt body */}
              <div className="space-y-1 px-6 py-4 text-[11px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Ref</span>
                  <span className="font-mono">{expense.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Date</span>
                  <span>{formatDate(expense.date)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Soumis par</span>
                  <span>{expense.submittedBy}</span>
                </div>
              </div>

              {/* Receipt description */}
              <div className="border-y border-dashed px-6 py-3">
                <p className="text-[11px] leading-relaxed text-foreground">{expense.description}</p>
              </div>

              {/* Receipt amounts */}
              <div className="space-y-1 px-6 py-4 text-[11px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sous-total HT</span>
                  <span className="font-mono">{formatMAD(expense.amountHT)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>TVA {expense.vatRate === "exempt" ? "(exo.)" : `${expense.vatRate}%`}</span>
                  <span className="font-mono">{formatMAD(expense.vat)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed pt-2 font-bold">
                  <span>TOTAL TTC</span>
                  <span className="font-mono">{formatMAD(expense.total)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="border-t px-6 py-3 text-center">
                <span className={cn(
                  "inline-block rotate-[-4deg] rounded border-2 px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest opacity-40",
                  expense.status === "validated" || expense.status === "reimbursed"
                    ? "border-emerald-500 text-emerald-600"
                    : expense.status === "rejected"
                      ? "border-red-500 text-red-600"
                      : "border-amber-500 text-amber-600",
                )}>
                  {STATUS[expense.status].label}
                </span>
              </div>

              {/* Upload CTA */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1.5 border-t px-6 py-4 text-center",
                  "transition-colors hover:bg-muted/40",
                )}
              >
                <Upload className="size-4 text-muted-foreground/50" />
                <p className="text-[10px] font-medium text-muted-foreground">
                  Ajouter le justificatif
                </p>
                <p className="text-[9px] text-muted-foreground/50">PDF, JPG, PNG — max 10 Mo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
