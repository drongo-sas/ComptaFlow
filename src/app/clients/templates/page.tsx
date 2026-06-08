"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Plus, CalendarDays, ChevronDown, ChevronUp,
  Pencil, Trash2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fiscalTemplates, type FiscalTemplate, type ObligationRuleType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<ObligationRuleType, { label: string; cls: string }> = {
  TVA:        { label: "TVA",        cls: "bg-blue-100 text-blue-700" },
  CNSS:       { label: "CNSS",       cls: "bg-purple-100 text-purple-700" },
  IR:         { label: "IR",         cls: "bg-indigo-100 text-indigo-700" },
  IS_acompte: { label: "IS",         cls: "bg-amber-100 text-amber-700" },
  bilan:      { label: "Bilan",      cls: "bg-emerald-100 text-emerald-700" },
  cotisation: { label: "Cotisation", cls: "bg-teal-100 text-teal-700" },
  autre:      { label: "Autre",      cls: "bg-zinc-100 text-zinc-600" },
};

const PERIODICITY_LABEL: Record<string, string> = {
  monthly:   "Mensuelle",
  quarterly: "Trimestrielle",
  annual:    "Annuelle",
};

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FiscalTemplate[]>(fiscalTemplates);
  const [expanded, setExpanded] = useState<string | null>(fiscalTemplates[0]?.id ?? null);
  const [deleted, setDeleted] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function handleDelete(id: string) {
    setDeleted(id);
    setTimeout(() => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setDeleted(null);
    }, 300);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">

      {/* ── Breadcrumb ── */}
      <button
        onClick={() => router.push("/clients")}
        className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Agenda fiscal
      </button>

      {/* ── Title ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Modèles de calendrier</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Créez des modèles d&apos;obligations fiscales et assignez-les à chaque dossier.
          </p>
        </div>
        <Button size="sm">
          <Plus className="size-4" />
          Nouveau modèle
        </Button>
      </div>

      {/* ── Info banner ── */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3.5">
        <CalendarDays className="mt-0.5 size-4 shrink-0 text-blue-500" />
        <p className="text-sm text-blue-800">
          Les modèles définissent les obligations fiscales périodiques (TVA, CNSS, IS…).
          Chaque dossier client hérite des obligations du modèle qui lui est assigné.
        </p>
      </div>

      {/* ── Template list ── */}
      <div className="space-y-3">
        {templates.map((tmpl) => {
          const isExpanded = expanded === tmpl.id;
          const isDeleting = deleted === tmpl.id;
          const monthlyCount    = tmpl.rules.filter((r) => r.periodicity === "monthly").length;
          const quarterlyCount  = tmpl.rules.filter((r) => r.periodicity === "quarterly").length;
          const annualCount     = tmpl.rules.filter((r) => r.periodicity === "annual").length;

          return (
            <div
              key={tmpl.id}
              className={cn(
                "rounded-xl border bg-card shadow-sm transition-opacity",
                isDeleting && "opacity-0 duration-300"
              )}
            >
              {/* Header */}
              <button
                onClick={() => toggle(tmpl.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{tmpl.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tmpl.description}</p>
                </div>

                {/* Rule counts */}
                <div className="hidden shrink-0 items-center gap-2 sm:flex">
                  {monthlyCount > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {monthlyCount} mensuelle{monthlyCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {quarterlyCount > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {quarterlyCount} trimestrielle{quarterlyCount > 1 ? "s" : ""}
                    </span>
                  )}
                  {annualCount > 0 && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      {annualCount} annuelle{annualCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {isExpanded
                  ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                  : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                }
              </button>

              {/* Expanded rules */}
              {isExpanded && (
                <div className="border-t px-5 pb-4 pt-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Obligations incluses
                    </p>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                        <Pencil className="size-3" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDelete(tmpl.id)}
                      >
                        <Trash2 className="size-3" />
                        Supprimer
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {tmpl.rules.map((rule) => {
                      const typeCfg = TYPE_CFG[rule.type];
                      return (
                        <div
                          key={rule.id}
                          className="flex items-center gap-3 rounded-lg border bg-background px-4 py-2.5"
                        >
                          <CheckCircle2 className="size-4 shrink-0 text-muted-foreground/40" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{rule.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {PERIODICITY_LABEL[rule.periodicity]} · dû le {rule.dueDayOfMonth} du mois
                              {rule.activeMonths && rule.periodicity === "quarterly"
                                ? ` (mars, juin, sept., déc.)`
                                : ""}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn("text-[10px] font-semibold", typeCfg.cls)}
                          >
                            {typeCfg.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add rule button */}
                  <button className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground">
                    <Plus className="size-4" />
                    Ajouter une obligation
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
