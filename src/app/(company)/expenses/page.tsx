"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, Receipt } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { expenses as seed, type Expense, CATEGORY_LABELS } from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";
import { ExpenseDetail } from "./expense-detail";
import { UploadExpenseModal } from "./upload-modal";

// ── Constants ─────────────────────────────────────────────────────────────────

type FilterKey = "all" | "pending" | "validated" | "reimbursed" | "rejected";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",        label: "Toutes"       },
  { key: "pending",    label: "En attente"   },
  { key: "validated",  label: "Validées"     },
  { key: "reimbursed", label: "Remboursées"  },
  { key: "rejected",   label: "Rejetées"     },
];

const STATUS = {
  pending:    { label: "En attente",  variant: "secondary"   as const, dot: "bg-amber-400"   },
  validated:  { label: "Validée",     variant: "default"     as const, dot: "bg-primary"     },
  reimbursed: { label: "Remboursée",  variant: "success"     as const, dot: "bg-emerald-400" },
  rejected:   { label: "Rejetée",     variant: "destructive" as const, dot: "bg-red-400"     },
};

const PAID_BY_LABELS: Record<Expense["paidBy"], string> = {
  company_card: "Carte",
  employee:     "Employé",
  cash:         "Espèces",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const { setCollapsed } = useSidebar();
  const [expenses,     setExpenses]     = useState<Expense[]>(seed);
  const [selected,     setSelected]     = useState<Expense | null>(null);
  const [filter,       setFilter]       = useState<FilterKey>("all");
  const [uploadOpen,   setUploadOpen]   = useState(false);

  useEffect(() => {
    setCollapsed(selected !== null);
    return () => setCollapsed(false);
  }, [selected, setCollapsed]);

  function handleAdd(expense: Expense) {
    setExpenses((prev) => [expense, ...prev]);
    setSelected(expense);
  }

  // ── Mutate helpers ──
  function updateStatus(id: string, status: Expense["status"]) {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }

  function handleSave(id: string, patch: Partial<Expense>) {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setSelected((prev) => (prev?.id === id ? { ...prev, ...patch } as Expense : prev));
  }

  // ── KPI computations ──
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const totalDuMois = useMemo(
    () =>
      expenses
        .filter((e) => e.date.startsWith(currentMonth))
        .reduce((s, e) => s + e.total, 0),
    [expenses, currentMonth],
  );

  const pendingCount = useMemo(
    () => expenses.filter((e) => e.status === "pending").length,
    [expenses],
  );

  const aRembourser = useMemo(
    () =>
      expenses
        .filter((e) => e.status === "validated" && e.paidBy === "employee")
        .reduce((s, e) => s + e.total, 0),
    [expenses],
  );

  // ── Filter counts ──
  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: expenses.length, pending: 0, validated: 0, reimbursed: 0, rejected: 0,
    };
    expenses.forEach((e) => { c[e.status]++; });
    return c;
  }, [expenses]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    if (filter === "all") return expenses;
    return expenses.filter((e) => e.status === filter);
  }, [expenses, filter]);

  // ── Filter tabs ──
  const filterTabs = (
    <div className="flex gap-1 overflow-x-auto">
      {FILTERS.map(({ key, label }) => {
        const count  = counts[key] ?? 0;
        const active = filter === key;
        return (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "min-w-[16px] rounded-full px-1 text-center text-[10px] font-semibold tabular-nums",
                  active
                    ? "bg-background/20 text-background"
                    : "bg-muted-foreground/15 text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {uploadOpen && (
        <UploadExpenseModal
          onClose={() => setUploadOpen(false)}
          onAdd={handleAdd}
        />
      )}
      <Topbar
        title="Dépenses"
        subtitle={`${expenses.length} dépense${expenses.length !== 1 ? "s" : ""} · ${pendingCount} en attente`}
      />

      {selected ? (
        /* ── SPLIT VIEW ── */
        <div className="flex flex-1 overflow-hidden">

          {/* Left narrow list (340px) */}
          <div className="flex w-[340px] shrink-0 flex-col border-r bg-background">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-semibold text-muted-foreground">
                {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              </p>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Plus className="size-3.5" />
                Nouvelle
              </Button>
            </div>

            {/* Filter tabs */}
            <div className="overflow-x-auto border-b px-3 pb-2">
              {filterTabs}
            </div>

            {/* Expense rows */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <Receipt className="size-7 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">Aucune dépense</p>
                </div>
              ) : (
                filtered.map((exp) => {
                  const sc  = STATUS[exp.status];
                  const sel = selected?.id === exp.id;
                  return (
                    <button
                      key={exp.id}
                      onClick={() => setSelected(exp)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors",
                        sel
                          ? "border-l-2 border-l-primary bg-primary/6"
                          : "border-l-2 border-l-transparent hover:bg-muted/50",
                      )}
                    >
                      {/* Category initial circle */}
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {CATEGORY_LABELS[exp.category].charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-semibold leading-tight">
                            {exp.description}
                          </p>
                          <p className="tnum shrink-0 font-mono text-sm font-semibold">
                            {formatMAD(exp.total)}
                          </p>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between">
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {CATEGORY_LABELS[exp.category]} · {formatDate(exp.date)}
                          </p>
                          <span className={cn("size-1.5 shrink-0 rounded-full", sc.dot)} />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: expense detail */}
          <ExpenseDetail
            key={selected?.id}
            expense={selected!}
            onClose={() => setSelected(null)}
            onSave={handleSave}
            onValidate={() => updateStatus(selected!.id, "validated")}
            onReject={() => updateStatus(selected!.id, "rejected")}
            onReimburse={() => updateStatus(selected!.id, "reimbursed")}
          />
        </div>
      ) : (
        /* ── FULL VIEW ── */
        <div className="flex-1 overflow-y-auto bg-paper">
          <div className="space-y-5 p-6">

            {/* KPI strip */}
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard
                label="Total du mois"
                value={formatMAD(totalDuMois)}
                sub="dépenses du mois en cours"
              />
              <KpiCard
                label="En attente"
                value={String(pendingCount)}
                sub={pendingCount > 0 ? "à valider" : "Aucune en attente"}
                tone={pendingCount > 0 ? "warning" : "default"}
              />
              <KpiCard
                label="À rembourser"
                value={formatMAD(aRembourser)}
                sub="avances employés validées"
                tone={aRembourser > 0 ? "warning" : "default"}
              />
            </div>

            {/* Toolbar: filter tabs + new button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1">
                {filterTabs}
              </div>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Plus className="size-3.5" />
                Nouvelle dépense
              </Button>
            </div>

            {/* Full table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>DATE</TableHead>
                    <TableHead>CATÉGORIE</TableHead>
                    <TableHead>DESCRIPTION</TableHead>
                    <TableHead>PAYÉ PAR</TableHead>
                    <TableHead className="text-right">MONTANT HT</TableHead>
                    <TableHead className="text-right">TVA</TableHead>
                    <TableHead className="text-right">TOTAL TTC</TableHead>
                    <TableHead>STATUT</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Receipt className="size-7 text-muted-foreground/30" />
                          <p className="text-sm">Aucune dépense</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((exp) => {
                      const sc = STATUS[exp.status];
                      return (
                        <TableRow
                          key={exp.id}
                          className="cursor-pointer"
                          onClick={() => setSelected(exp)}
                        >
                          <TableCell className="text-sm">{formatDate(exp.date)}</TableCell>
                          <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                            {CATEGORY_LABELS[exp.category]}
                          </TableCell>
                          <TableCell className="font-medium">{exp.description}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              {PAID_BY_LABELS[exp.paidBy]}
                            </span>
                          </TableCell>
                          <TableCell className="tnum text-right font-mono text-sm text-muted-foreground">
                            {formatMAD(exp.amountHT)}
                          </TableCell>
                          <TableCell className="tnum text-right font-mono text-sm text-muted-foreground">
                            {formatMAD(exp.vat)}
                          </TableCell>
                          <TableCell className="tnum text-right font-mono text-sm font-semibold">
                            {formatMAD(exp.total)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={sc.variant}>{sc.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const valueClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground";

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={cn("tnum mt-2 font-mono text-2xl font-semibold tracking-tight", valueClass)}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
