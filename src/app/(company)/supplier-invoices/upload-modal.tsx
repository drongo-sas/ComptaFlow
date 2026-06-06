"use client";

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, FileText, Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatMAD } from "@/lib/utils";
import { getSessionId } from "@/lib/session-id";
import type { ExtractedInvoice } from "@/app/api/ai/extract-invoice/route";
import type { SupplierInvoice } from "@/lib/mock-data";

interface Props {
  onClose: () => void;
  onAdd: (invoice: SupplierInvoice) => void;
  source?: "upload" | "email";
}

const VAT_RATES = ["20", "14", "10", "7", "0", "exempt"] as const;

export function UploadInvoiceModal({ onClose, onAdd, source = "upload" }: Props) {
  const [step, setStep] = useState<"upload" | "extracting" | "review">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedInvoice | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setStep("extracting");

    try {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("filename", f.name);

      const res = await fetch("/api/ai/extract-invoice", {
        method: "POST",
        headers: { "X-Session-Id": getSessionId() },
        body: formData,
      });

      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json() as { fields: ExtractedInvoice };
      setFields(data.fields);
      setStep("review");
    } catch {
      setError("Extraction impossible. Vérifiez le fichier ou saisissez les données manuellement.");
      // Still go to review with empty fields
      setFields({
        supplier: "", number: "", date: "", dueDate: "",
        amountHT: 0, vat: 0, total: 0, vatRate: "20",
      });
      setStep("review");
    }
  }, []);

  function updateField<K extends keyof ExtractedInvoice>(key: K, value: ExtractedInvoice[K]) {
    setFields((f) => {
      if (!f) return f;
      const next = { ...f, [key]: value };
      // Recompute vat + total when amountHT or vatRate changes
      if (key === "amountHT" || key === "vatRate") {
        const ht = key === "amountHT" ? (value as number) : f.amountHT;
        const rate = key === "vatRate" ? (value as string) : f.vatRate;
        const vatNum = rate === "exempt" ? 0 : parseFloat(rate) / 100;
        next.vat = Math.round(ht * vatNum * 100) / 100;
        next.total = Math.round((ht + next.vat) * 100) / 100;
      }
      return next;
    });
  }

  function handleConfirm() {
    if (!fields) return;
    const invoice: SupplierInvoice = {
      id: `s-${Date.now()}`,
      supplier: fields.supplier || "Fournisseur inconnu",
      number: fields.number || `FAC-${Date.now()}`,
      date: fields.date || new Date().toISOString().split("T")[0],
      dueDate: fields.dueDate || new Date().toISOString().split("T")[0],
      amountHT: fields.amountHT,
      vat: fields.vat,
      total: fields.total,
      source,
      status: "draft",
    };
    onAdd(invoice);
    onClose();
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-2xl flex-col rounded-2xl border bg-background shadow-2xl"
        style={{ maxHeight: "86vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">
              {step === "upload"
                ? "Importer une facture"
                : step === "extracting"
                  ? "Extraction IA en cours…"
                  : "Vérifier les données extraites"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step === "upload"
                ? "PDF, image JPG ou PNG — l'IA lira automatiquement les champs"
                : step === "extracting"
                  ? `Analyse de « ${file?.name} »`
                  : "Vérifiez et corrigez si nécessaire avant de valider"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── Step 1: Upload ── */}
        {step === "upload" && (
          <div className="flex flex-col items-center gap-6 p-8">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-colors",
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className={cn("flex size-14 items-center justify-center rounded-2xl", dragging ? "bg-primary/10" : "bg-muted")}>
                <Upload className={cn("size-7", dragging ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {dragging ? "Relâchez pour analyser" : "Glissez votre facture ici"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  ou{" "}
                  <span className="text-primary underline-offset-2 hover:underline">
                    cliquez pour sélectionner
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground/60">PDF · JPG · PNG</p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />
          </div>
        )}

        {/* ── Step 2: Extracting ── */}
        {step === "extracting" && (
          <div className="flex flex-col items-center gap-7 px-8 py-16">
            {/* File card */}
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-5 py-3.5">
              <FileText className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file ? `${(file.size / 1024).toFixed(0)} Ko` : ""}
                </p>
              </div>
            </div>
            {/* AI animation */}
            <div className="relative flex size-16 items-center justify-center">
              <Loader2 className="absolute size-16 animate-spin text-primary/25" />
              <Sparkles className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Lecture IA de la facture…</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Extraction du fournisseur, montants, TVA et échéances
              </p>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2 animate-bounce rounded-full bg-primary/50"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === "review" && fields && (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              {/* AI success / error banner */}
              <div className={cn(
                "mb-5 flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-xs font-medium",
                error
                  ? "border-warning/25 bg-warning/8 text-warning-foreground"
                  : "border-primary/15 bg-primary/5 text-primary"
              )}>
                {error
                  ? <AlertCircle className="size-3.5 shrink-0" />
                  : <Sparkles className="size-3.5 shrink-0" />}
                {error
                  ? "Extraction partielle — vérifiez et complétez les champs manquants."
                  : `IA · Données extraites depuis « ${file?.name} » — vérifiez avant de valider.`}
              </div>

              {/* Form grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Fournisseur"
                  value={fields.supplier}
                  onChange={(v) => updateField("supplier", v)}
                  placeholder="Nom du fournisseur"
                  className="sm:col-span-2"
                />
                <Field
                  label="N° Facture"
                  value={fields.number}
                  onChange={(v) => updateField("number", v)}
                  placeholder="FAC-2026-0001"
                />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Taux TVA</label>
                  <select
                    value={fields.vatRate}
                    onChange={(e) => updateField("vatRate", e.target.value as ExtractedInvoice["vatRate"])}
                    className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {VAT_RATES.map((r) => (
                      <option key={r} value={r}>
                        {r === "exempt" ? "Exonéré / Hors champ" : `${r}%`}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label="Date facture" value={fields.date} onChange={(v) => updateField("date", v)} type="date" />
                <Field label="Date échéance" value={fields.dueDate} onChange={(v) => updateField("dueDate", v)} type="date" />

                {/* Amounts row */}
                <div className="sm:col-span-2 grid grid-cols-3 gap-3 rounded-xl border bg-muted/30 p-4">
                  <AmountField
                    label="Montant HT"
                    value={fields.amountHT}
                    onChange={(v) => updateField("amountHT", v)}
                  />
                  <AmountField label="TVA" value={fields.vat} onChange={(v) => updateField("vat", v)} muted />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Total TTC</p>
                    <p className="tnum font-mono text-lg font-bold text-foreground">
                      {formatMAD(fields.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t bg-card px-6 py-4">
              <button
                type="button"
                onClick={() => { setStep("upload"); setFile(null); setFields(null); setError(null); }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Changer de fichier
              </button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>Annuler</Button>
                <Button size="sm" onClick={handleConfirm}>
                  <CheckCircle2 className="size-4" />
                  Valider la facture
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Small form components ─────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = "text", className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function AmountField({
  label, value, onChange, muted,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={cn(
          "tnum h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          muted && "text-muted-foreground"
        )}
      />
    </div>
  );
}
