"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Ban, CalendarDays } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  accountingClients, dossierObligations,
  type DossierObligation, type ObligationRuleType,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ── Config ────────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-06-08");
function isOverdue(d: string) { return new Date(d) < TODAY; }
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MA", { day: "numeric", month: "short" });
}

const TYPE_CFG: Record<ObligationRuleType, { label: string; cls: string }> = {
  TVA:        { label: "TVA",        cls: "bg-blue-100 text-blue-700"       },
  CNSS:       { label: "CNSS",       cls: "bg-purple-100 text-purple-700"   },
  IR:         { label: "IR",         cls: "bg-indigo-100 text-indigo-700"   },
  IS_acompte: { label: "IS",         cls: "bg-amber-100 text-amber-700"     },
  bilan:      { label: "Bilan",      cls: "bg-emerald-100 text-emerald-700" },
  cotisation: { label: "Cotisation", cls: "bg-teal-100 text-teal-700"       },
  autre:      { label: "Autre",      cls: "bg-zinc-100 text-zinc-600"       },
};

const ASSIGNEES: Record<string, { id: string; initials: string; color: string }> = {
  cl1: { id: "ab", initials: "AB", color: "bg-primary"    },
  cl2: { id: "nf", initials: "NF", color: "bg-violet-500" },
  cl3: { id: "ko", initials: "KO", color: "bg-sky-500"    },
  cl4: { id: "nf", initials: "NF", color: "bg-violet-500" },
  cl5: { id: "ko", initials: "KO", color: "bg-sky-500"    },
};

const TEAM = [
  { id: "all", label: "Tous les collaborateurs" },
  { id: "ab",  label: "A. Benjelloun" },
  { id: "nf",  label: "N. El Fassi"  },
  { id: "ko",  label: "K. Ouali"     },
];

// ── Columns ───────────────────────────────────────────────────────────────────

type ColId = "todo" | "ongoing" | "done";

const COLUMNS: {
  id: ColId; label: string;
  strip: string; dot: string; dropRing: string;
}[] = [
  { id: "todo",    label: "À faire",  strip: "border-t-slate-300",   dot: "bg-slate-400",   dropRing: "ring-slate-300"   },
  { id: "ongoing", label: "En cours", strip: "border-t-amber-400",   dot: "bg-amber-400",   dropRing: "ring-amber-300"   },
  { id: "done",    label: "Fait",     strip: "border-t-emerald-400", dot: "bg-emerald-400", dropRing: "ring-emerald-300" },
];

function getCol(o: DossierObligation): ColId {
  if (o.status === "done") return "done";
  if (o.status === "blocked" || isOverdue(o.dueDate)) return "ongoing";
  return "todo";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BoardPage() {
  const router = useRouter();
  const [userFilter,    setUserFilter]    = useState("all");
  const [dossierFilter, setDossierFilter] = useState("all");
  const [overrides,     setOverrides]     = useState<Record<string, ColId>>({});
  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [dragOverCol,   setDragOverCol]   = useState<ColId | null>(null);

  const clientMap = useMemo(
    () => Object.fromEntries(accountingClients.map((c) => [c.id, c])),
    []
  );

  function effectiveCol(o: DossierObligation): ColId {
    return overrides[o.id] ?? getCol(o);
  }

  const obs = useMemo(() => {
    return dossierObligations.filter((o) => {
      if (o.status === "na") return false;
      if (dossierFilter !== "all" && o.clientId !== dossierFilter) return false;
      if (userFilter    !== "all" && ASSIGNEES[o.clientId]?.id !== userFilter) return false;
      return true;
    });
  }, [userFilter, dossierFilter]);

  const byCol = useMemo(() => {
    const map: Record<ColId, DossierObligation[]> = { todo: [], ongoing: [], done: [] };
    for (const o of obs) map[effectiveCol(o)].push(o);
    map.todo    = map.todo.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    map.ongoing = map.ongoing.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    map.done    = map.done.sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""));
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obs, overrides]);

  function handleDrop(colId: ColId, e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("cardId");
    if (id) setOverrides((prev) => ({ ...prev, [id]: colId }));
    setDragOverCol(null);
    setDraggingId(null);
  }

  return (
    <>
      <Topbar title="Suivi des obligations" subtitle="Toutes les échéances · vue kanban" initials="AB" />
      <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden">

        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-3 border-b bg-background px-6 py-3">
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="h-8 w-52 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dossierFilter} onValueChange={setDossierFilter}>
            <SelectTrigger className="h-8 w-48 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les dossiers</SelectItem>
              {accountingClients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground">
            {obs.length} obligation{obs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Board ── */}
        <div className="flex flex-1 items-start gap-4 overflow-x-auto px-6 py-5">
          {COLUMNS.map((col) => {
            const cards     = byCol[col.id];
            const isDragOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setDragOverCol(null);
                }}
                onDrop={(e) => handleDrop(col.id, e)}
                className={cn(
                  "flex w-80 shrink-0 flex-col rounded-2xl border-t-[3px] bg-muted/40 transition-all",
                  col.strip,
                  isDragOver && `ring-2 ${col.dropRing} bg-muted/70`
                )}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className={cn("size-2 rounded-full", col.dot)} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.label}
                  </span>
                  <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-background text-[10px] font-semibold text-muted-foreground shadow-sm">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto px-2 pb-3">
                  {cards.length === 0 ? (
                    <div className={cn(
                      "rounded-xl border-2 border-dashed py-10 text-center text-xs text-muted-foreground/40 transition-colors",
                      isDragOver ? "border-muted-foreground/30 bg-background/60" : "border-muted-foreground/10"
                    )}>
                      Déposer ici
                    </div>
                  ) : cards.map((o) => {
                    const client   = clientMap[o.clientId];
                    const typeCfg  = TYPE_CFG[o.type];
                    const assignee = ASSIGNEES[o.clientId];
                    const blocked  = o.status === "blocked";
                    const overdue  = col.id === "ongoing" && !blocked;
                    const isDragging = draggingId === o.id;

                    return (
                      <Card
                        key={o.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("cardId", o.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggingId(o.id);
                        }}
                        onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                        onClick={() => router.push(`/clients/${o.clientId}`)}
                        className={cn(
                          "cursor-grab p-4 transition-all active:cursor-grabbing",
                          isDragging
                            ? "rotate-1 scale-95 opacity-50 shadow-lg"
                            : "hover:-translate-y-px hover:shadow-md"
                        )}
                      >
                        {/* Alert chip — only for urgent states */}
                        {(col.id !== "todo") && (
                          <div className="mb-3">
                            {col.id === "done" && o.doneAt ? (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle2 className="size-3" />
                                Traité le {fmtShort(o.doneAt)}
                              </Badge>
                            ) : blocked ? (
                              <Badge variant="destructive" className="gap-1">
                                <Ban className="size-3" />{o.note}
                              </Badge>
                            ) : overdue ? (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="size-3" />
                                En retard · {fmtShort(o.dueDate)}
                              </Badge>
                            ) : null}
                          </div>
                        )}

                        {/* Obligation name */}
                        <p className={cn(
                          "text-sm font-semibold leading-snug",
                          col.id === "done" ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {o.label}
                        </p>

                        {/* Footer */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
                              {client?.initials}
                            </div>
                            <span className="max-w-[80px] truncate text-xs text-muted-foreground">
                              {client?.name.split(" ")[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {/* Date — shown quietly in footer for À faire only */}
                            {col.id === "todo" && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                                <CalendarDays className="size-3" />
                                {fmtShort(o.dueDate)}
                              </span>
                            )}
                            <Badge className={cn("text-[10px]", typeCfg.cls)}>
                              {typeCfg.label}
                            </Badge>
                            <div className={cn(
                              "flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white",
                              assignee.color
                            )}>
                              {assignee.initials}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
