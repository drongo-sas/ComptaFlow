"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type TxCategory, CATEGORY_LABELS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type VatRateOpt = "20" | "14" | "10" | "7" | "0" | "exempt";
type PaidByOpt  = "company_card" | "employee" | "cash";

const EXPENSE_CATEGORIES: TxCategory[] = [
  "meals", "transport", "supplies", "software", "telecom",
  "marketing", "utilities", "rent", "other",
];

const VAT_OPTIONS: { value: VatRateOpt; label: string }[] = [
  { value: "20",     label: "20 %" },
  { value: "14",     label: "14 %" },
  { value: "10",     label: "10 %" },
  { value: "7",      label: "7 %"  },
  { value: "0",      label: "0 %"  },
  { value: "exempt", label: "Exonéré" },
];

const PAID_BY_OPTIONS: { value: PaidByOpt; label: string }[] = [
  { value: "company_card", label: "Carte entreprise" },
  { value: "employee",     label: "Avance employé"  },
  { value: "cash",         label: "Espèces"          },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewExpensePage() {
  const router = useRouter();
  const { setCollapsed } = useSidebar();

  // Collapse sidebar on mount
  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

  const [description, setDescription] = useState("");
  const [date, setDate]               = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory]       = useState<TxCategory>("meals");
  const [amountHT, setAmountHT]       = useState("");
  const [vatRate, setVatRate]         = useState<VatRateOpt>("20");
  const [paidBy, setPaidBy]           = useState<PaidByOpt>("employee");
  const [submittedBy, setSubmittedBy] = useState("Yassine B.");
  const [notes, setNotes]             = useState("");

  // Computed
  const ht  = parseFloat(amountHT) || 0;
  const vat = vatRate === "exempt" || vatRate === "0"
    ? 0
    : ht * parseFloat(vatRate) / 100;
  const ttc = ht + vat;

  function handleSave() {
    // In a real app this would POST to an API
    router.push("/expenses");
  }

  return (
    <>
      <Topbar title="Nouvelle dépense" subtitle="" />

      <div className="flex flex-1 items-start justify-center overflow-y-auto bg-paper p-8">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-5 p-6">

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : Déjeuner client, abonnement logiciel…"
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                )}
              />
            </div>

            {/* Date + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TxCategory)}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Montant HT + Taux TVA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Montant HT (MAD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountHT}
                  onChange={(e) => setAmountHT(e.target.value)}
                  placeholder="0,00"
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm font-mono",
                    "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Taux TVA</label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value as VatRateOpt)}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                >
                  {VAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Computed totals (read-only) */}
            {ht > 0 && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span className="font-mono">{vat.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 text-sm font-semibold">
                  <span>Total TTC</span>
                  <span className="font-mono">{ttc.toFixed(2)} MAD</span>
                </div>
              </div>
            )}

            {/* Payé par + Soumis par */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Payé par</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value as PaidByOpt)}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                >
                  {PAID_BY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Soumis par</label>
                <input
                  type="text"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className={cn(
                    "w-full rounded-md border bg-background px-3 py-2 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-ring",
                  )}
                />
              </div>
            </div>

            {/* File upload area */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Justificatif</label>
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed",
                  "border-muted-foreground/25 bg-muted/30 py-8 text-center",
                  "cursor-pointer transition-colors hover:border-muted-foreground/40 hover:bg-muted/50",
                )}
              >
                <Upload className="size-6 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  Glissez un fichier ou cliquez pour ajouter
                </p>
                <p className="text-xs text-muted-foreground/60">PDF, JPG, PNG — max 10 Mo</p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optionnel)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Informations complémentaires…"
                className={cn(
                  "w-full rounded-md border bg-background px-3 py-2 text-sm resize-none",
                  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                )}
              />
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
