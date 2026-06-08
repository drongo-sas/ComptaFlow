"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Check, Ban,
  CheckCircle2, AlertTriangle,
  RotateCcw, MessageSquare, Paperclip, X, Upload, Clock,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import {
  accountingClients,
  getClientObligations,
  type DossierObligation,
  type ObligationRuleType,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

// ── Constants ──────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-06-08");

const TYPE_CFG: Record<ObligationRuleType, { label: string; cls: string }> = {
  TVA:        { label: "TVA",        cls: "bg-blue-100 text-blue-700" },
  CNSS:       { label: "CNSS",       cls: "bg-purple-100 text-purple-700" },
  IR:         { label: "IR",         cls: "bg-indigo-100 text-indigo-700" },
  IS_acompte: { label: "IS",         cls: "bg-amber-100 text-amber-700" },
  bilan:      { label: "Bilan",      cls: "bg-emerald-100 text-emerald-700" },
  cotisation: { label: "Cotisation", cls: "bg-teal-100 text-teal-700" },
  autre:      { label: "Autre",      cls: "bg-zinc-100 text-zinc-600" },
};

interface ObligationMeta {
  comment: string;
  fileName?: string;
}

function isOverdue(dueDate: string) { return new Date(dueDate) < TODAY; }

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-MA", { day: "numeric", month: "short", year: "numeric" });
}

function fmtShort(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-MA", { day: "numeric", month: "short" });
}

function sortObligations(obligations: DossierObligation[]) {
  const rank = (o: DossierObligation) => {
    if (o.status === "done") return 3;
    if (o.status === "na")   return 4;
    if (o.status === "blocked" || isOverdue(o.dueDate)) return 0;
    return 1;
  };
  return [...obligations].sort((a, b) => {
    const dr = rank(a) - rank(b);
    if (dr !== 0) return dr;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DossierPage() {
  const { id }   = useParams<{ id: string }>();
  const { setActiveClientId } = useRole();

  const client = accountingClients.find((c) => c.id === id);

  const [obligations, setObligations] = useState<DossierObligation[]>(
    () => getClientObligations(id)
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, ObligationMeta>>({});

  if (!client) {
    return <main className="p-8 text-muted-foreground">Dossier introuvable.</main>;
  }

  function markDone(oblId: string) {
    setObligations((prev) =>
      prev.map((o) => o.id === oblId ? { ...o, status: "done" as const, doneAt: "2026-06-08" } : o)
    );
    setExpandedId(oblId);
  }

  function markPending(oblId: string) {
    setObligations((prev) =>
      prev.map((o) => o.id === oblId ? { ...o, status: "pending" as const, doneAt: undefined } : o)
    );
    if (expandedId === oblId) setExpandedId(null);
  }

  function updateMeta(oblId: string, update: Partial<ObligationMeta>) {
    setMeta((prev) => ({
      ...prev,
      [oblId]: { ...{ comment: "" }, ...prev[oblId], ...update },
    }));
  }

  function openWorkspace() {
    setActiveClientId(client!.id);
  }

  const sorted = sortObligations(obligations.filter((o) => o.status !== "na"));

  return (
    <>
      <Topbar
        title={client.name}
        subtitle={`${client.legalForm} · ${client.city} · ${client.activity}`}
        initials="AB"
      />
      <main className="px-6 py-6">

        {/* ── Obligations: flat grid sorted by urgency ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((o) => (
            <ObligationCard
              key={o.id}
              obligation={o}
              expanded={expandedId === o.id}
              obligationMeta={meta[o.id]}
              onToggleExpand={() => setExpandedId((prev) => prev === o.id ? null : o.id)}
              onMarkDone={() => markDone(o.id)}
              onMarkPending={() => markPending(o.id)}
              onUpdateMeta={(update) => updateMeta(o.id, update)}
              onOpenWorkspace={() => openWorkspace()}
            />
          ))}
        </div>
      </main>
    </>
  );
}

// ── ObligationCard ─────────────────────────────────────────────────────────────

function ObligationCard({
  obligation: o,
  expanded,
  obligationMeta,
  onToggleExpand,
  onMarkDone,
  onMarkPending,
  onUpdateMeta,
  onOpenWorkspace,
}: {
  obligation: DossierObligation;
  expanded: boolean;
  obligationMeta?: ObligationMeta;
  onToggleExpand: () => void;
  onMarkDone: () => void;
  onMarkPending: () => void;
  onUpdateMeta: (update: Partial<ObligationMeta>) => void;
  onOpenWorkspace: () => void;
}) {
  const fileRef   = useRef<HTMLInputElement>(null);
  const isDone    = o.status === "done";
  const isBlocked = o.status === "blocked";
  const overdue   = !isDone && !isBlocked && isOverdue(o.dueDate);
  const typeCfg   = TYPE_CFG[o.type];
  const hasNote   = (obligationMeta?.comment?.trim().length ?? 0) > 0;
  const hasFile   = !!obligationMeta?.fileName;

  return (
    <div className="flex min-h-[200px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">

      <div className="flex flex-1 flex-col px-5 py-5">

        {/* ── Urgency chip — icon only for alert states, plain text for normal ── */}
        <div className="mb-5">
          {isDone && o.doneAt ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="size-3" />
              Traité le {fmtShort(o.doneAt)}
            </span>
          ) : isBlocked && o.note ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
              <Ban className="size-3" />
              {o.note}
            </span>
          ) : overdue ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
              <AlertTriangle className="size-3" />
              En retard · {fmtShort(o.dueDate)}
            </span>
          ) : (
            <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
              Avant le {fmtShort(o.dueDate)}
            </span>
          )}
        </div>

        {/* ── Title (hero) + type badge inline below ── */}
        <div className="flex-1">
          <p className={cn(
            "text-lg font-semibold leading-snug",
            isDone ? "text-muted-foreground" : "text-foreground"
          )}>
            {o.label}
          </p>
          <span className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", typeCfg.cls)}>
            {typeCfg.label}
          </span>
        </div>

        {/* ── CTA ── */}
        <div className="mt-6 border-t pt-4">
          {isDone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleExpand}
                  title="Note & pièce jointe"
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    expanded ? "bg-primary/10 text-primary"
                      : "text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground"
                  )}
                >
                  <MessageSquare className="size-3.5" />
                </button>
                {hasFile && <Paperclip className="size-3.5 text-muted-foreground/40" />}
              </div>
              <button
                onClick={onMarkPending}
                className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
              >
                Annuler
              </button>
            </div>
          ) : isBlocked ? (
            <button onClick={onOpenWorkspace} className="text-sm font-medium text-primary hover:underline">
              Résoudre l&apos;erreur →
            </button>
          ) : (
            <button
              onClick={onMarkDone}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors",
                overdue
                  ? "text-red-600 hover:text-red-700"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              <Check className="size-3.5" />
              Marquer fait →
            </button>
          )}
        </div>
      </div>

      {/* ── Expandable note/attachment ── */}
      {isDone && expanded && (
        <div className="border-t bg-muted/30 px-4 py-3 space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MessageSquare className="size-3.5" />Commentaire
            </label>
            <textarea
              rows={2}
              value={obligationMeta?.comment ?? ""}
              onChange={(e) => onUpdateMeta({ comment: e.target.value })}
              placeholder="Note, référence de paiement…"
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Paperclip className="size-3.5" />Pièce jointe
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpdateMeta({ fileName: file.name });
              }}
            />
            {obligationMeta?.fileName ? (
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
                <Paperclip className="size-3.5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm">{obligationMeta.fileName}</span>
                <button onClick={() => onUpdateMeta({ fileName: undefined })} className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" className="gap-2 text-xs" onClick={() => fileRef.current?.click()}>
                <Upload className="size-3.5" />Joindre un fichier
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
