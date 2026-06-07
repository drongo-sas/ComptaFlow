"use client";

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, FileText, Loader2, Sparkles, CheckCircle2, AlertCircle, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type Expense, type TxCategory, CATEGORY_LABELS } from "@/lib/mock-data";

// ── Mock OCR templates ────────────────────────────────────────────────────────

interface ExtractedExpense {
  description: string;
  date: string;
  category: TxCategory;
  amountHT: number;
  vatRate: Expense["vatRate"];
  vat: number;
  total: number;
  paidBy: Expense["paidBy"];
  submittedBy: string;
}

const MOCK_TEMPLATES: {
  keywords: string[];
  description: string;
  category: TxCategory;
  vatRate: Expense["vatRate"];
  baseHT: number;
}[] = [
  { keywords: ["restaurant","repas","dejeuner","cafe","pizza"],  description: "Repas d'affaires",              category: "meals",     vatRate: "10", baseHT: 420  },
  { keywords: ["taxi","uber","carbu","essence","train","peage"], description: "Frais de transport",            category: "transport", vatRate: "10", baseHT: 380  },
  { keywords: ["amazon","logiciel","saas","abonnement","app"],   description: "Abonnement logiciel",           category: "software",  vatRate: "20", baseHT: 500  },
  { keywords: ["maroc telecom","iam","inwi","telecom","orange"], description: "Facture télécom professionnelle", category: "telecom",   vatRate: "20", baseHT: 416  },
  { keywords: ["hotel","sofitel","hilton","hebergement","nuit"], description: "Hébergement professionnel",     category: "transport", vatRate: "10", baseHT: 1250 },
  { keywords: ["papeterie","bureau","fourniture","imprimerie"],  description: "Fournitures de bureau",         category: "supplies",  vatRate: "20", baseHT: 580  },
  { keywords: ["pub","affiche","marketing","flyer","brochure"],  description: "Supports marketing",           category: "marketing", vatRate: "20", baseHT: 1400 },
];

function mockExtract(filename: string): ExtractedExpense {
  const lower = filename.toLowerCase();
  const match =
    MOCK_TEMPLATES.find((t) => t.keywords.some((k) => lower.includes(k))) ??
    MOCK_TEMPLATES[Math.floor(Math.random() * MOCK_TEMPLATES.length)];

  const variation = 0.75 + Math.random() * 0.5;
  const amountHT  = Math.round(match.baseHT * variation * 100) / 100;
  const vatNum    = match.vatRate === "exempt" ? 0 : parseFloat(match.vatRate) / 100;
  const vat       = Math.round(amountHT * vatNum * 100) / 100;
  const total     = Math.round((amountHT + vat) * 100) / 100;

  const today  = new Date();
  const offset = Math.floor(Math.random() * 7); // 0–6 days ago
  const date   = new Date(today.getTime() - offset * 86_400_000)
    .toISOString().split("T")[0];

  return {
    description: match.description,
    date,
    category: match.category,
    amountHT,
    vatRate: match.vatRate,
    vat,
    total,
    paidBy: "employee",
    submittedBy: "Yassine B.",
  };
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onAdd: (expense: Expense) => void;
}

const VAT_OPTIONS: { value: Expense["vatRate"]; label: string }[] = [
  { value: "20", label: "20 %" }, { value: "14", label: "14 %" },
  { value: "10", label: "10 %" }, { value: "7",  label: "7 %"  },
  { value: "0",  label: "0 %"  }, { value: "exempt", label: "Exonéré" },
];

const EXPENSE_CATEGORIES: TxCategory[] = [
  "meals", "transport", "supplies", "software", "telecom",
  "marketing", "utilities", "rent", "other",
];

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadExpenseModal({ onClose, onAdd }: Props) {
  const [step,     setStep]     = useState<"upload" | "extracting" | "review">("upload");
  const [file,     setFile]     = useState<File | null>(null);
  const [fileUrl,  setFileUrl]  = useState<string | null>(null);
  const [fileExt,  setFileExt]  = useState<"image" | "pdf">("image");
  const [dragging, setDragging] = useState(false);
  const [fields,   setFields]   = useState<ExtractedExpense | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setStep("extracting");
    const url = URL.createObjectURL(f);
    setFileUrl(url);
    setFileExt(f.type === "application/pdf" ? "pdf" : "image");

    // Simulate OCR delay
    setTimeout(() => {
      setFields(mockExtract(f.name));
      setStep("review");
    }, 1800);
  }, []);

  function updateField<K extends keyof ExtractedExpense>(key: K, value: ExtractedExpense[K]) {
    setFields((f) => {
      if (!f) return f;
      const next = { ...f, [key]: value };
      if (key === "amountHT" || key === "vatRate") {
        const ht   = key === "amountHT" ? (value as number) : f.amountHT;
        const rate = key === "vatRate"   ? (value as string) : f.vatRate;
        const vatN = rate === "exempt" ? 0 : parseFloat(rate) / 100;
        next.vat   = Math.round(ht * vatN * 100) / 100;
        next.total = Math.round((ht + next.vat) * 100) / 100;
      }
      return next;
    });
  }

  function handleConfirm() {
    if (!fields) return;
    const expense: Expense = {
      id: `e-${Date.now()}`,
      description: fields.description || "Dépense sans description",
      date:        fields.date || new Date().toISOString().split("T")[0],
      category:    fields.category,
      amountHT:    fields.amountHT,
      vatRate:     fields.vatRate,
      vat:         fields.vat,
      total:       fields.total,
      paidBy:      fields.paidBy,
      submittedBy: fields.submittedBy,
      status:      "pending",
      receiptUrl:  fileUrl ?? undefined,
      receiptType: fileExt,
    };
    onAdd(expense);
    onClose();
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) processFile(f);
    },
    [processFile],
  );

  const inputCls = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const labelCls = "mb-1.5 block text-xs font-medium text-muted-foreground";

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
              {step === "upload"     ? "Importer un justificatif"          :
               step === "extracting" ? "Lecture OCR en cours…"             :
                                       "Vérifier les données extraites"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step === "upload"     ? "PDF, JPG ou PNG — l'IA lira automatiquement les champs" :
               step === "extracting" ? `Analyse de « ${file?.name} »`                           :
                                       "Vérifiez et corrigez si nécessaire avant de valider"}
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
                  : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/30",
              )}
            >
              <div className={cn(
                "flex size-14 items-center justify-center rounded-2xl",
                dragging ? "bg-primary/10" : "bg-muted",
              )}>
                <Upload className={cn("size-7", dragging ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {dragging ? "Relâchez pour analyser" : "Glissez votre justificatif ici"}
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
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-5 py-3.5">
              <FileText className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file ? `${(file.size / 1024).toFixed(0)} Ko` : ""}
                </p>
              </div>
            </div>
            <div className="relative flex size-16 items-center justify-center">
              <Loader2 className="absolute size-16 animate-spin text-primary/25" />
              <Sparkles className="size-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Lecture OCR du justificatif…</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Extraction du montant, TVA et catégorie
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
            <div className="flex flex-1 overflow-hidden">

              {/* Left: form */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* AI banner */}
                <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-primary/15 bg-primary/5 px-4 py-2.5 text-xs font-medium text-primary">
                  <Sparkles className="size-3.5 shrink-0" />
                  IA · Données extraites depuis «&nbsp;{file?.name}&nbsp;» — vérifiez avant de valider.
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className={labelCls}>Description</label>
                    <input
                      type="text"
                      value={fields.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  {/* Date + Category */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Date</label>
                    <input
                      type="date"
                      value={fields.date}
                      onChange={(e) => updateField("date", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Catégorie</label>
                    <select
                      value={fields.category}
                      onChange={(e) => updateField("category", e.target.value as TxCategory)}
                      className={inputCls}
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Payé par + Soumis par */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Payé par</label>
                    <select
                      value={fields.paidBy}
                      onChange={(e) => updateField("paidBy", e.target.value as Expense["paidBy"])}
                      className={inputCls}
                    >
                      <option value="company_card">Carte entreprise</option>
                      <option value="employee">Avance employé</option>
                      <option value="cash">Espèces</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelCls}>Soumis par</label>
                    <input
                      type="text"
                      value={fields.submittedBy}
                      onChange={(e) => updateField("submittedBy", e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  {/* Amounts */}
                  <div className="sm:col-span-2 grid grid-cols-3 gap-3 rounded-xl border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Montant HT</p>
                      <input
                        type="number"
                        step="0.01"
                        value={fields.amountHT}
                        onChange={(e) => updateField("amountHT", parseFloat(e.target.value) || 0)}
                        className="tnum h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Taux TVA</p>
                      <select
                        value={fields.vatRate}
                        onChange={(e) => updateField("vatRate", e.target.value as Expense["vatRate"])}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {VAT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Total TTC</p>
                      <p className="tnum h-9 flex items-center font-mono text-lg font-bold">
                        {fields.total.toLocaleString("fr-MA", { minimumFractionDigits: 2 })} MAD
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: file preview */}
              {fileUrl && (
                <div className="hidden w-64 shrink-0 border-l bg-muted/20 sm:flex sm:flex-col sm:overflow-hidden">
                  <p className="shrink-0 border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Justificatif
                  </p>
                  <div className="flex-1 overflow-hidden">
                    {fileExt === "image" ? (
                      <img src={fileUrl} alt="Justificatif" className="h-full w-full object-contain" />
                    ) : (
                      <iframe src={fileUrl} title="Justificatif" className="h-full w-full border-0" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t bg-card px-6 py-4">
              <button
                type="button"
                onClick={() => { setStep("upload"); setFile(null); setFields(null); }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Changer de fichier
              </button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>Annuler</Button>
                <Button size="sm" onClick={handleConfirm}>
                  <CheckCircle2 className="size-4" />
                  Valider la dépense
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
