"use client";

import { Edit2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type CustomerInvoice, type InvoiceLineItem, company } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";

interface Props {
  invoice: CustomerInvoice;
  onClose: () => void;
  onEdit: () => void;
}

const TODAY = new Date().toISOString().split("T")[0];

type EffectiveStatus = "draft" | "sent" | "paid" | "overdue";

const STATUS = {
  draft:   { label: "Brouillon", variant: "secondary"   as const },
  sent:    { label: "Envoyée",   variant: "default"     as const },
  paid:    { label: "Payée",     variant: "success"     as const },
  overdue: { label: "En retard", variant: "destructive" as const },
};

function effectiveStatus(inv: CustomerInvoice): EffectiveStatus {
  if (inv.status === "sent" && inv.dueDate < TODAY) return "overdue";
  if (inv.status === "partial") return "sent";
  if (inv.status === "overdue") return "overdue";
  return inv.status as EffectiveStatus;
}

function lineHT(item: InvoiceLineItem) { return item.quantity * item.unitPrice; }
function lineVAT(item: InvoiceLineItem) {
  if (item.vatRate === "exempt") return 0;
  return (lineHT(item) * parseFloat(item.vatRate)) / 100;
}

export function InvoiceDetail({ invoice, onClose, onEdit }: Props) {
  const st  = effectiveStatus(invoice);
  const sc  = STATUS[st];
  const isDraft = st === "draft";

  const totalHT  = invoice.items.reduce((s, i) => s + lineHT(i), 0);
  const totalVAT = invoice.items.reduce((s, i) => s + lineVAT(i), 0);
  const totalTTC = totalHT + totalVAT;

  const vatGroups = invoice.items.reduce((acc, item) => {
    if (item.vatRate === "exempt") return acc;
    acc[item.vatRate] = (acc[item.vatRate] || 0) + lineVAT(item);
    return acc;
  }, {} as Record<string, number>);

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
            {(invoice.customer || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold leading-tight">{invoice.customer || "—"}</p>
            <p className="font-mono text-xs text-muted-foreground">{invoice.number}</p>
          </div>
          <Badge variant={sc.variant}>{sc.label}</Badge>
        </div>

        {isDraft && (
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 className="size-3.5" />
            Modifier
          </Button>
        )}
      </div>

      {/* ── Invoice preview (document viewer style) ── */}
      <div className="flex-1 overflow-y-auto bg-[#e8e8e8] p-8">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border bg-white text-[11px] shadow-lg">

          {/* Company header */}
          <div className="border-b px-8 pb-5 pt-7">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background text-sm font-black">
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
                <p className="text-3xl font-black uppercase tracking-tight">Facture</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{invoice.number}</p>
              </div>
            </div>
          </div>

          {/* Emitter / Client */}
          <div className="grid grid-cols-2 gap-6 border-b px-8 py-5">
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Émetteur
              </p>
              <p className="font-semibold">{company.name}</p>
              <p className="text-muted-foreground">{company.address}</p>
              <p className="text-muted-foreground">{company.city}</p>
            </div>
            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Client
              </p>
              <p className="font-semibold">{invoice.customer || "—"}</p>
              {invoice.customerAddress && <p className="text-muted-foreground">{invoice.customerAddress}</p>}
              {invoice.customerCity    && <p className="text-muted-foreground">{invoice.customerCity}</p>}
              {invoice.customerICE     && <p className="mt-1 text-muted-foreground">ICE&nbsp;: {invoice.customerICE}</p>}
              {invoice.customerIF      && <p className="text-muted-foreground">IF&nbsp;: {invoice.customerIF}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6 border-b bg-muted/20 px-8 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Date émission</span>
              <span className="font-semibold">{formatDate(invoice.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Échéance</span>
              <span className={cn("font-semibold", st === "overdue" && "text-destructive")}>
                {formatDate(invoice.dueDate)}
              </span>
            </div>
          </div>

          {/* Line items */}
          <div className="px-8 py-5">
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="border-b-2 border-foreground/10">
                  <th className="pb-2.5 text-left font-semibold uppercase tracking-wide text-muted-foreground">Désignation</th>
                  <th className="w-10 pb-2.5 text-center font-semibold uppercase tracking-wide text-muted-foreground">Qté</th>
                  <th className="w-24 pb-2.5 text-right font-semibold uppercase tracking-wide text-muted-foreground">P.U. HT</th>
                  <th className="w-12 pb-2.5 text-center font-semibold uppercase tracking-wide text-muted-foreground">TVA</th>
                  <th className="w-24 pb-2.5 text-right font-semibold uppercase tracking-wide text-muted-foreground">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center italic text-muted-foreground">Aucune ligne</td>
                  </tr>
                ) : (
                  invoice.items.map((item, idx) => (
                    <tr key={item.id} className={cn("border-b border-muted/40", idx % 2 === 1 && "bg-muted/20")}>
                      <td className="py-2 pr-3">{item.description || "—"}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">{formatMAD(item.unitPrice)}</td>
                      <td className="py-2 text-center">{item.vatRate === "exempt" ? "Exo." : `${item.vatRate}%`}</td>
                      <td className="py-2 text-right font-mono">{formatMAD(lineHT(item))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t bg-muted/20 px-8 py-5">
            <div className="ml-auto max-w-[220px] space-y-1.5">
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
              <div className="flex justify-between border-t border-foreground/20 pt-2 text-[13px] font-bold">
                <span>Total TTC</span>
                <span className="font-mono">{formatMAD(totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Status stamp */}
          {(st === "paid" || st === "overdue") && (
            <div className="flex justify-center border-t px-8 py-4">
              <span className={cn(
                "rotate-[-8deg] rounded border-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest opacity-40",
                st === "paid" ? "border-emerald-500 text-emerald-600" : "border-red-500 text-red-600",
              )}>
                {st === "paid" ? "Payée" : "En retard"}
              </span>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t px-8 py-4">
              <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t px-8 py-4 text-center text-[9px] text-muted-foreground">
            <p className="font-medium">Merci de votre confiance — {company.name}</p>
            <p className="mt-0.5">Règlement par virement — RIB&nbsp;: {company.rib}</p>
            <p className="mt-0.5">RC&nbsp;: {company.rc} · ICE&nbsp;: {company.ice} · TP&nbsp;: {company.tp}</p>
            <p className="mt-1 text-[8px] text-muted-foreground/60">
              Conformément à la loi 9-88, tout retard de paiement entraîne des pénalités au taux légal en vigueur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
