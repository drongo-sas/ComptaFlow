"use client";

import { useState, useEffect } from "react";
import { Lock, CheckCircle2, ChevronDown, Search, X, Link2, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatMAD, formatDate } from "@/lib/utils";
import {
  type BankTransaction,
  type TxCategory,
  type VatRate,
  CATEGORY_LABELS,
  CATEGORY_GROUPS,
  VAT_RATE_GROUPS,
  getVatLabel,
} from "@/lib/mock-data";

interface Props {
  tx: BankTransaction | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<BankTransaction>) => void;
  /** "inline" renders as a flex panel (no backdrop / fixed positioning) */
  mode?: "drawer" | "inline";
}

export function TransactionDrawer({ tx, onClose, onSave, mode = "drawer" }: Props) {
  const [category, setCategory] = useState<TxCategory | null>(null);
  const [vat, setVat] = useState<VatRate | null>(null);
  const [note, setNote] = useState("");
  const [verified, setVerified] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [vatOpen, setVatOpen] = useState(false);

  useEffect(() => {
    if (tx) {
      setCategory(tx.category);
      setVat(tx.vat);
      setNote(tx.note);
      setVerified(tx.verified);
      setCatOpen(false);
      setCatSearch("");
      setVatOpen(false);
    }
  }, [tx?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tx) return null;

  const filteredGroups = CATEGORY_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        catSearch === "" ||
        CATEGORY_LABELS[item].toLowerCase().includes(catSearch.toLowerCase())
    ),
  })).filter((g) => g.items.length > 0);

  function handleApply() {
    onSave(tx!.id, { category, vat, note, verified });
    onClose();
  }

  // ── Shared header ─────────────────────────────────────────────────────────────
  const header = (
    <div className="flex shrink-0 items-center justify-between border-b bg-card px-5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted"
          title="Fermer"
        >
          <X className="size-4" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ventilation de la transaction
          </p>
          <h2 className="truncate text-sm font-semibold">{tx.label}</h2>
        </div>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        <Button size="sm" onClick={handleApply}>
          Appliquer
        </Button>
      </div>
    </div>
  );

  // ── Shared body ───────────────────────────────────────────────────────────────
  const body = (
    <div className="flex min-h-0 flex-1 overflow-y-auto">

      {/* Left — Informations */}
      <div className="flex w-72 shrink-0 flex-col gap-5 border-r bg-muted/20 p-6">
        <h3 className="text-sm font-semibold">Informations</h3>

        <LockedField label="Libellé" value={tx.label} />
        <LockedField label="Date" value={formatDate(tx.date)} />
        <LockedField label="Compte" value={tx.account} />
        <LockedField
          label="Montant TTC"
          value={(tx.amount > 0 ? "+" : "") + formatMAD(tx.amount)}
          valueClass={cn("tnum font-mono", tx.amount > 0 ? "text-success" : "")}
        />

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Annotations</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Texte ou #étiquette"
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-input bg-card px-4 py-3">
          <span className="text-sm font-medium">Transaction vérifiée</span>
          <Toggle value={verified} onChange={setVerified} />
        </div>
      </div>

      {/* Right — Ventilation + Pièce liée */}
      <div className="flex flex-1 flex-col gap-5 p-6">

        {/* Ventilation card */}
        <div>
          <h3 className="mb-4 text-sm font-semibold">Ventilation</h3>
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Ventilation 1
            </p>

            <div className="space-y-4">

              {/* Category picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Catégorie</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setCatOpen((o) => !o); setVatOpen(false); }}
                    className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
                  >
                    <span className={cn(!category && "text-muted-foreground")}>
                      {category ? CATEGORY_LABELS[category] : "Choisir une catégorie…"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  </button>

                  {catOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border bg-popover shadow-lg">
                        <div className="sticky top-0 border-b bg-popover p-2">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                              autoFocus
                              value={catSearch}
                              onChange={(e) => setCatSearch(e.target.value)}
                              placeholder="Rechercher…"
                              className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                          </div>
                        </div>
                        {filteredGroups.map((group) => (
                          <div key={group.label}>
                            <p className="bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                              {group.label}
                            </p>
                            {group.items.map((item) => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => { setCategory(item); setCatOpen(false); setCatSearch(""); }}
                                className={cn(
                                  "flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors hover:bg-accent",
                                  category === item && "bg-accent/60 font-medium"
                                )}
                              >
                                {CATEGORY_LABELS[item]}
                                {category === item && <CheckCircle2 className="size-3.5 text-primary" />}
                              </button>
                            ))}
                          </div>
                        ))}
                        {filteredGroups.length === 0 && (
                          <p className="p-4 text-center text-sm text-muted-foreground">
                            Aucune catégorie trouvée.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Amount locked */}
              <LockedField
                label="Montant TTC"
                value={formatMAD(tx.amount)}
                valueClass="tnum font-mono"
              />

              {/* VAT picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">TVA</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => { setVatOpen((o) => !o); setCatOpen(false); }}
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm transition-colors hover:bg-accent",
                      !vat
                        ? "border-warning/60 bg-warning/8 text-warning-foreground"
                        : "border-input bg-background"
                    )}
                  >
                    <span>{getVatLabel(vat)}</span>
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                  </button>

                  {vatOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setVatOpen(false)} />
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border bg-popover shadow-lg">
                        <button
                          type="button"
                          onClick={() => { setVat(null); setVatOpen(false); }}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent",
                            vat === null && "bg-accent/60 font-medium text-foreground"
                          )}
                        >
                          À définir
                          {vat === null && <CheckCircle2 className="size-3.5 text-primary" />}
                        </button>
                        {VAT_RATE_GROUPS.map((group) => (
                          <div key={group.label}>
                            <p className="bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                              {group.label}
                            </p>
                            {group.rates.map((rate) => (
                              <button
                                key={rate.value}
                                type="button"
                                onClick={() => { setVat(rate.value); setVatOpen(false); }}
                                className={cn(
                                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent",
                                  vat === rate.value && "bg-accent/60 font-medium"
                                )}
                              >
                                {rate.label}
                                {vat === rate.value && <CheckCircle2 className="size-3.5 text-primary" />}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Pièce liée */}
        <div>
          <h3 className="mb-3 text-sm font-semibold">Pièce liée</h3>
          {tx.matched ? (
            <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="size-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {tx.category === "customer_payment" ? "Facture client" : "Facture fournisseur"}
                </p>
                <p className="font-mono text-xs text-muted-foreground">{tx.reference}</p>
              </div>
              <button className="text-xs font-medium text-primary hover:underline">
                Voir →
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/30 p-4">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Link2Off className="size-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">Aucune pièce liée</p>
                <p className="text-xs text-muted-foreground">Liez une facture ou un avoir</p>
              </div>
              <button className="shrink-0 rounded-md border border-dashed px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                Lier
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  // ── Inline mode ───────────────────────────────────────────────────────────────
  if (mode === "inline") {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {header}
        {body}
      </div>
    );
  }

  // ── Drawer mode (default) ─────────────────────────────────────────────────────
  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[680px] flex-col border-l bg-background shadow-2xl">
        {header}
        {body}
      </div>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function LockedField({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-muted/40 px-3">
        <span className={cn("flex-1 truncate text-sm font-medium", valueClass)}>{value}</span>
        <Lock className="size-3.5 shrink-0 text-muted-foreground/50" />
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        value ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          value ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
