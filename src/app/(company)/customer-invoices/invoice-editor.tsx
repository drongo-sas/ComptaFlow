"use client";

import { useState } from "react";
import { X, Plus, Trash2, CheckCircle2, CreditCard, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type CustomerInvoice, type InvoiceLineItem, company } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  invoice: CustomerInvoice;
  onSave: (id: string, patch: Partial<CustomerInvoice>) => void;
  onClose: () => void;
}

// ── Status ────────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

type EffectiveStatus = "draft" | "sent" | "paid" | "overdue";

const STATUS = {
  draft:   { label: "Brouillon", variant: "secondary"   as const },
  sent:    { label: "Envoyée",   variant: "default"     as const },
  paid:    { label: "Payée",     variant: "success"     as const },
  overdue: { label: "En retard", variant: "destructive" as const },
};

function getEffectiveStatus(inv: CustomerInvoice): EffectiveStatus {
  if (inv.status === "sent" && inv.dueDate < TODAY) return "overdue";
  if (inv.status === "partial") return "sent";
  if (inv.status === "overdue") return "overdue";
  return inv.status as EffectiveStatus;
}

// ── Computation helpers ───────────────────────────────────────────────────────

function lineHT(item: InvoiceLineItem) {
  return item.quantity * item.unitPrice;
}

function lineVAT(item: InvoiceLineItem) {
  if (item.vatRate === "exempt") return 0;
  return (lineHT(item) * parseFloat(item.vatRate)) / 100;
}

const VAT_RATE_OPTIONS: { value: InvoiceLineItem["vatRate"]; label: string }[] = [
  { value: "20",     label: "20%" },
  { value: "14",     label: "14%" },
  { value: "10",     label: "10%" },
  { value: "7",      label: "7%"  },
  { value: "0",      label: "0%"  },
  { value: "exempt", label: "Exonéré" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function InvoiceEditor({ invoice, onSave, onClose }: Props) {
  const [fields, setFields] = useState<CustomerInvoice>({ ...invoice });
  const [saved,  setSaved]  = useState(false);

  const st = getEffectiveStatus(fields);
  const sc = STATUS[st];

  // ── Totals ──
  const totalHT  = fields.items.reduce((s, item) => s + lineHT(item), 0);
  const totalVAT = fields.items.reduce((s, item) => s + lineVAT(item), 0);
  const totalTTC = totalHT + totalVAT;

  const vatGroups = fields.items.reduce((acc, item) => {
    if (item.vatRate === "exempt") return acc;
    acc[item.vatRate] = (acc[item.vatRate] || 0) + lineVAT(item);
    return acc;
  }, {} as Record<string, number>);

  // ── Field helpers ──
  function setField<K extends keyof CustomerInvoice>(key: K, value: CustomerInvoice[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function updateLine(idx: number, patch: Partial<InvoiceLineItem>) {
    setFields((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
    setSaved(false);
  }

  function deleteLine(idx: number) {
    setFields((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    setSaved(false);
  }

  function addLine() {
    setFields((f) => ({
      ...f,
      items: [
        ...f.items,
        { id: `line-${Date.now()}`, description: "", quantity: 1, unitPrice: 0, vatRate: "20" },
      ],
    }));
    setSaved(false);
  }

  function handleSave() {
    onSave(fields.id, { ...fields, amountHT: totalHT, vat: totalVAT, total: totalTTC });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function advance() {
    const next: CustomerInvoice["status"] | null =
      st === "draft"   ? "sent" :
      st === "sent"    ? "paid" :
      st === "overdue" ? "paid" : null;
    if (!next) return;
    setFields((f) => ({ ...f, status: next }));
    onSave(fields.id, { status: next });
  }

  const advanceLabel =
    st === "draft"   ? "Envoyer"       :
    st === "sent"    ? "Marquer payée" :
    st === "overdue" ? "Marquer payée" : null;

  return (
    <div className="flex flex-1 overflow-hidden">
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
              {(fields.customer || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold leading-tight">{fields.customer || "Nouveau client"}</p>
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

        {/* ── Two-column body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT — Editor (55%) */}
          <div className="flex w-[55%] flex-col overflow-y-auto border-r">
            <div className="space-y-6 p-5">

              {/* Section 1 — Invoice info */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-foreground">
                  Informations facture
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">N° Facture</label>
                    <input
                      type="text"
                      value={fields.number}
                      onChange={(e) => setField("number", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div /> {/* spacer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Date facture</label>
                    <input
                      type="date"
                      value={fields.date}
                      onChange={(e) => setField("date", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Date échéance</label>
                    <input
                      type="date"
                      value={fields.dueDate}
                      onChange={(e) => setField("dueDate", e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2 — Client */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-foreground">
                  Client
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Raison sociale</label>
                    <input
                      type="text"
                      value={fields.customer}
                      onChange={(e) => setField("customer", e.target.value)}
                      placeholder="Nom du client"
                      className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Adresse</label>
                    <input
                      type="text"
                      value={fields.customerAddress ?? ""}
                      onChange={(e) => setField("customerAddress", e.target.value)}
                      placeholder="Rue, quartier…"
                      className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Ville</label>
                    <input
                      type="text"
                      value={fields.customerCity ?? ""}
                      onChange={(e) => setField("customerCity", e.target.value)}
                      placeholder="Casablanca…"
                      className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">ICE client</label>
                    <input
                      type="text"
                      value={fields.customerICE ?? ""}
                      onChange={(e) => setField("customerICE", e.target.value)}
                      placeholder="000000000000000"
                      className="h-9 w-full rounded-md border border-input bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">IF client</label>
                    <input
                      type="text"
                      value={fields.customerIF ?? ""}
                      onChange={(e) => setField("customerIF", e.target.value)}
                      placeholder="Identifiant fiscal"
                      className="h-9 w-full rounded-md border border-input bg-card px-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3 — Line items */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-foreground">
                  Lignes de facturation
                </p>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_56px_84px_76px_68px_28px] gap-1 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>Désignation</span>
                  <span className="text-center">Qté</span>
                  <span className="text-right">P.U. HT</span>
                  <span className="text-center">TVA</span>
                  <span className="text-right">Total HT</span>
                  <span />
                </div>

                <div className="space-y-1.5">
                  {fields.items.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Aucune ligne — cliquez sur «&nbsp;Ajouter une ligne&nbsp;»
                    </p>
                  )}
                  {fields.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_56px_84px_76px_68px_28px] items-center gap-1"
                    >
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLine(idx, { description: e.target.value })}
                        placeholder="Description…"
                        className="h-8 w-full rounded border border-input bg-card px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={item.quantity}
                        onChange={(e) => updateLine(idx, { quantity: parseFloat(e.target.value) || 1 })}
                        className="h-8 w-full rounded border border-input bg-card px-2 text-center text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) => updateLine(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="h-8 w-full rounded border border-input bg-card px-2 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <select
                        value={item.vatRate}
                        onChange={(e) => updateLine(idx, { vatRate: e.target.value as InvoiceLineItem["vatRate"] })}
                        className="h-8 w-full rounded border border-input bg-card px-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {VAT_RATE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <span className="text-right font-mono text-xs text-muted-foreground">
                        {new Intl.NumberFormat("fr-MA", { minimumFractionDigits: 2 }).format(lineHT(item))}
                      </span>
                      <button
                        onClick={() => deleteLine(idx)}
                        className="flex items-center justify-center rounded p-1 text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addLine}
                  className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                  Ajouter une ligne
                </button>
              </section>

              {/* Section 4 — Notes */}
              <section>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-foreground">
                  Notes / Conditions
                </p>
                <textarea
                  value={fields.notes ?? ""}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Conditions de paiement, références commande…"
                  rows={3}
                  className="w-full resize-none rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </section>

              {/* Section 5 — Totals */}
              <section>
                <div className="ml-auto max-w-xs space-y-1.5 rounded-lg border bg-muted/30 p-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sous-total HT</span>
                    <span className="font-mono">{formatMAD(totalHT)}</span>
                  </div>
                  {Object.entries(vatGroups).map(([rate, amount]) => (
                    <div key={rate} className="flex justify-between text-sm text-muted-foreground">
                      <span>TVA {rate}%</span>
                      <span className="font-mono">{formatMAD(amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 text-base font-bold">
                    <span>Total TTC</span>
                    <span className="font-mono">{formatMAD(totalTTC)}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT — Live preview (45%) */}
          <div className="flex w-[45%] flex-col overflow-y-auto bg-gray-50 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Aperçu facture
            </p>

            {/* Invoice card */}
            <div className="overflow-hidden rounded-xl border bg-white text-[11px] shadow-sm">

              {/* Company header */}
              <div className="border-b px-6 pb-4 pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-foreground text-background text-sm font-black">
                      {company.initials}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-base font-bold leading-tight">{company.name}</p>
                      <p className="text-muted-foreground">{company.address}, {company.city}</p>
                      <p className="text-muted-foreground">
                        ICE&nbsp;: {company.ice} · IF&nbsp;: {company.identifiantFiscal}
                      </p>
                      <p className="text-muted-foreground">
                        TP&nbsp;: {company.tp} · RC&nbsp;: {company.rc}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black uppercase tracking-tight">Facture</p>
                    <p className="mt-0.5 font-mono text-muted-foreground">{fields.number}</p>
                  </div>
                </div>
              </div>

              {/* Emitter / Client / Dates */}
              <div className="grid grid-cols-2 gap-4 border-b px-6 py-4">
                <div>
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Émetteur
                  </p>
                  <p className="font-semibold">{company.name}</p>
                  <p className="text-muted-foreground">{company.address}</p>
                  <p className="text-muted-foreground">{company.city}</p>
                </div>
                <div>
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Client
                  </p>
                  <p className="font-semibold">{fields.customer || "—"}</p>
                  {fields.customerAddress && (
                    <p className="text-muted-foreground">{fields.customerAddress}</p>
                  )}
                  {fields.customerCity && (
                    <p className="text-muted-foreground">{fields.customerCity}</p>
                  )}
                  {fields.customerICE && (
                    <p className="mt-1 text-muted-foreground">ICE&nbsp;: {fields.customerICE}</p>
                  )}
                  {fields.customerIF && (
                    <p className="text-muted-foreground">IF&nbsp;: {fields.customerIF}</p>
                  )}
                </div>
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-4 border-b bg-muted/20 px-6 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Date émission
                  </span>
                  <span className="font-medium">{formatDate(fields.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Échéance
                  </span>
                  <span className={cn("font-medium", st === "overdue" && "text-destructive")}>
                    {formatDate(fields.dueDate)}
                  </span>
                </div>
              </div>

              {/* Line items */}
              <div className="px-6 py-4">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="pb-2 text-left font-semibold uppercase tracking-wide text-muted-foreground">Désignation</th>
                      <th className="w-8 pb-2 text-center font-semibold uppercase tracking-wide text-muted-foreground">Qté</th>
                      <th className="w-20 pb-2 text-right font-semibold uppercase tracking-wide text-muted-foreground">P.U. HT</th>
                      <th className="w-10 pb-2 text-center font-semibold uppercase tracking-wide text-muted-foreground">TVA</th>
                      <th className="w-20 pb-2 text-right font-semibold uppercase tracking-wide text-muted-foreground">Total HT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center italic text-muted-foreground">
                          Aucune ligne
                        </td>
                      </tr>
                    ) : (
                      fields.items.map((item, idx) => (
                        <tr key={item.id} className={cn("border-b border-muted/50", idx % 2 === 1 && "bg-muted/20")}>
                          <td className="py-1.5 pr-2">{item.description || <span className="italic text-muted-foreground">—</span>}</td>
                          <td className="py-1.5 text-center">{item.quantity}</td>
                          <td className="py-1.5 text-right font-mono">{formatMAD(item.unitPrice)}</td>
                          <td className="py-1.5 text-center">{item.vatRate === "exempt" ? "Exo." : `${item.vatRate}%`}</td>
                          <td className="py-1.5 text-right font-mono">{formatMAD(lineHT(item))}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t bg-muted/20 px-6 py-4">
                <div className="ml-auto max-w-[200px] space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sous-total HT</span>
                    <span className="font-mono">{formatMAD(totalHT)}</span>
                  </div>
                  {Object.entries(vatGroups).map(([rate, amount]) => (
                    <div key={rate} className="flex justify-between text-muted-foreground">
                      <span>TVA {rate}%</span>
                      <span className="font-mono">{formatMAD(amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-foreground/20 pt-2 text-[12px] font-bold">
                    <span>Total TTC</span>
                    <span className="font-mono">{formatMAD(totalTTC)}</span>
                  </div>
                </div>
              </div>

              {/* Status stamp */}
              {(st === "paid" || st === "overdue") && (
                <div className="flex justify-center border-t px-6 py-3">
                  <span className={cn(
                    "rotate-[-8deg] rounded border-2 px-3 py-1 text-[9px] font-bold uppercase tracking-widest opacity-50",
                    st === "paid" ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600",
                  )}>
                    {st === "paid" ? "Payée" : "En retard"}
                  </span>
                </div>
              )}

              {/* Notes */}
              {fields.notes && (
                <div className="border-t px-6 py-3">
                  <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
                  <p className="whitespace-pre-wrap text-muted-foreground">{fields.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t px-6 py-3 text-center text-[9px] text-muted-foreground">
                <p className="font-medium">Merci de votre confiance — {company.name}</p>
                <p className="mt-0.5">
                  Règlement par virement — RIB&nbsp;: {company.rib}
                </p>
                <p className="mt-0.5">
                  RC&nbsp;: {company.rc} · ICE&nbsp;: {company.ice} · TP&nbsp;: {company.tp}
                </p>
                <p className="mt-1 text-[8px] text-muted-foreground/60">
                  Conformément à la loi 9-88, tout retard de paiement entraîne des pénalités au taux légal en vigueur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
