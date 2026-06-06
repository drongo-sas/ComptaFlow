"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Download, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatMAD, formatDate } from "@/lib/utils";
import type { BankTransaction } from "@/lib/mock-data";

interface Props {
  onClose: () => void;
  onImport: (txs: BankTransaction[]) => void;
  hint?: string;
}

const SAMPLE_CSV = [
  "Date;Libellé;Référence;Débit;Crédit",
  "30/05/2026;VIR REÇU GROUPE SAHAM;VIR-11290;;26400",
  "29/05/2026;PRLV LOYER BUREAU AGDAL;LOY-0526;9500;",
  "28/05/2026;CB MARJANE HYPERMARCHE;CB-44210;1240;",
  "27/05/2026;PAIEMENT TVA DGI;TVA-0526;8340;",
  "26/05/2026;VIR REÇU IMPRIMERIE NAJAH;VIR-10955;;6720",
  "25/05/2026;FRAIS TENUE COMPTE;FRAIS-0526;45;",
  "24/05/2026;VIR SALAIRE PERSONNEL;SAL-0526;42000;",
].join("\n");

function parseDate(raw: string): string {
  const parts = raw.trim().split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y.length === 2 ? "20" + y : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return new Date().toISOString().split("T")[0];
}

function parseNum(s: string | undefined): number {
  if (!s) return 0;
  return parseFloat(s.trim().replace(/\s/g, "").replace(",", ".")) || 0;
}

function parseCSV(text: string): BankTransaction[] {
  const sep = text.includes(";") ? ";" : ",";
  const lines = text.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const idx = (terms: string[]) =>
    headers.findIndex((h) => terms.some((t) => h.includes(t)));

  const dateIdx = idx(["date"]);
  const labelIdx = idx(["libellé", "libelle", "label", "description", "désignation"]);
  const refIdx = idx(["réf", "ref", "référence", "numéro", "numero"]);
  const debitIdx = idx(["débit", "debit", "sortie"]);
  const creditIdx = idx(["crédit", "credit", "entrée", "entree"]);
  const amountIdx = idx(["montant", "amount"]);

  const results: BankTransaction[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(sep).map((c) => c.trim().replace(/"/g, ""));

    let amount = 0;
    if (debitIdx >= 0 && creditIdx >= 0) {
      amount = parseNum(cells[creditIdx]) - parseNum(cells[debitIdx]);
    } else if (amountIdx >= 0) {
      amount = parseNum(cells[amountIdx]);
    }
    if (amount === 0) continue;

    results.push({
      id: `imp-${Date.now()}-${i}`,
      date: dateIdx >= 0 ? parseDate(cells[dateIdx] ?? "") : new Date().toISOString().split("T")[0],
      label: cells[labelIdx >= 0 ? labelIdx : 1] ?? `Transaction ${i}`,
      reference: cells[refIdx >= 0 ? refIdx : 0] ?? "",
      amount,
      account: "Relevé importé",
      category: null,
      matched: false,
      vat: null,
      verified: false,
      note: "",
    });
  }
  return results;
}

function downloadSample() {
  const blob = new Blob(["﻿" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "exemple-releve.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportModal({ onClose, onImport, hint }: Props) {
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<BankTransaction[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const txs = parseCSV(text);
      if (txs.length === 0) {
        setError("Aucune transaction détectée. Vérifiez le format ou téléchargez l'exemple.");
        return;
      }
      setParsed(txs);
      setStep("preview");
    };
    reader.onerror = () => setError("Erreur de lecture du fichier.");
    reader.readAsText(f, "utf-8");
  }, []);

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
        style={{ maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">Importer un relevé bancaire</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {step === "upload"
                ? hint ?? "Formats acceptés : CSV, Excel — Attijariwafa, BMCE, CIH, BP…"
                : `${parsed.length} transactions détectées dans « ${file?.name} »`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Upload step */}
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
              <div className={cn("flex size-14 items-center justify-center rounded-2xl transition-colors", dragging ? "bg-primary/10" : "bg-muted")}>
                <Upload className={cn("size-7 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {dragging ? "Relâchez pour importer" : "Glissez votre fichier ici"}
                </p>
                <p className="mt-1 text-sm">
                  ou{" "}
                  <span className="text-primary underline-offset-2 hover:underline">
                    cliquez pour sélectionner
                  </span>
                </p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.ofx,.txt"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            />

            {error && (
              <div className="flex w-full items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={downloadSample}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Download className="size-3.5" />
              Télécharger un fichier exemple (CSV)
            </button>
          </div>
        )}

        {/* Preview step */}
        {step === "preview" && (
          <>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 border-b bg-muted/60">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Date</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Libellé</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Référence</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parsed.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30">
                      <td className="tnum whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-2.5 font-medium">{t.label}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{t.reference}</td>
                      <td className={cn(
                        "tnum whitespace-nowrap px-4 py-2.5 text-right font-mono font-medium",
                        t.amount > 0 ? "text-success" : ""
                      )}>
                        {t.amount > 0 ? "+" : ""}
                        {formatMAD(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t bg-card px-6 py-4">
              <button
                type="button"
                onClick={() => { setStep("upload"); setFile(null); setParsed([]); setError(null); }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Changer de fichier
              </button>
              <Button onClick={() => onImport(parsed)}>
                Importer {parsed.length} transaction{parsed.length > 1 ? "s" : ""}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
