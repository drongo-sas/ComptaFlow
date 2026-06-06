"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CircleHelp, Loader2, Link2, Link2Off, Sparkles, Upload, X } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  bankTransactions as seed,
  bankAccountCoverage as coverageSeed,
  bankAccountCoverage2025,
  company,
  fiscalYears,
  CATEGORY_LABELS,
  getVatLabel,
  type BankTransaction,
  type BankAccountCoverage,
  type TxCategory,
  type VatRate,
} from "@/lib/mock-data";
import { getSessionId } from "@/lib/session-id";
import { formatMAD, formatDate, cn } from "@/lib/utils";
import { TransactionDrawer } from "./transaction-drawer";
import { ImportModal } from "./import-modal";
import { RelevesTab } from "./releves-tab";

type Tab = "transactions" | "releves";
type Filter = "all" | "categorized" | "uncategorized";

export default function BankTransactionsPage() {
  const [tab, setTab] = useState<Tab>("transactions");
  const [rows, setRows] = useState<BankTransaction[]>(seed);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importTarget, setImportTarget] = useState<{
    accountId: string;
    month: number;
    year: number;
  } | null>(null);
  const [coverage, setCoverage] = useState<BankAccountCoverage[]>(coverageSeed);
  const [relevesYear, setRelevesYear] = useState<number>(company.activeYear);
  const [aiPending, setAiPending] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [pendingAiIds, setPendingAiIds] = useState<Set<string>>(new Set());
  const [aiDoneCount, setAiDoneCount] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate progress bar while AI is running
  useEffect(() => {
    if (aiPending) {
      setAiProgress(8);
      progressTimer.current = setInterval(() => {
        setAiProgress((p) => (p >= 82 ? p : p + (82 - p) * 0.06));
      }, 120);
    } else {
      if (progressTimer.current) clearInterval(progressTimer.current);
    }
    return () => { if (progressTimer.current) clearInterval(progressTimer.current); };
  }, [aiPending]);

  const availableYears = fiscalYears.map((fy) => fy.year);

  // For historical years use static seed; for active year use mutable coverage state
  const visibleCoverage: BankAccountCoverage[] =
    relevesYear === 2025
      ? bankAccountCoverage2025
      : relevesYear === company.activeYear
        ? coverage
        : coverageSeed;

  // ── derived ────────────────────────────────────────────────────────────────
  const counts = useMemo(
    () => ({
      all: rows.length,
      categorized: rows.filter((r) => r.category).length,
      uncategorized: rows.filter((r) => !r.category).length,
    }),
    [rows]
  );

  const totalMissing = useMemo(
    () =>
      coverage.reduce(
        (n, acc) => n + acc.statements.filter((s) => s.status === "missing").length,
        0
      ),
    [coverage]
  );

  function handleYearChange(y: number) {
    setRelevesYear(y);
  }

  const visible = rows.filter((r) =>
    filter === "all" ? true : filter === "categorized" ? !!r.category : !r.category
  );

  // ── handlers ───────────────────────────────────────────────────────────────
  function handleSave(id: string, patch: Partial<BankTransaction>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setSelectedTx((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }

  function handleImportRequest(accountId: string, month: number, year: number) {
    setImportTarget({ accountId, month, year });
    setImportOpen(true);
  }

  function handleImport(txs: BankTransaction[]) {
    // Close modal immediately — don't block the user
    setRows((prev) => [...txs, ...prev]);
    setImportOpen(false);

    // Mark coverage cell as imported if triggered from Relevés tab
    if (importTarget) {
      const { accountId, month, year } = importTarget;
      setCoverage((prev) =>
        prev.map((acc) =>
          acc.id === accountId
            ? {
                ...acc,
                statements: acc.statements.map((s) =>
                  s.month === month && s.year === year
                    ? { ...s, status: "imported" as const, importedAt: new Date().toISOString().split("T")[0] }
                    : s
                ),
              }
            : acc
        )
      );
    }
    setImportTarget(null);

    // Fire AI in background for the newly imported rows
    const targets = txs.map((t) => ({ id: t.id, label: t.label, amount: t.amount }));
    runBackgroundAI(targets);
  }

  // ── Background AI categorization (shared by import + batch button) ──────────
  async function runBackgroundAI(
    targets: { id: string; label: string; amount: number }[]
  ) {
    if (!targets.length || aiPending) return;
    setAiPending(true);
    setPendingAiIds(new Set(targets.map((t) => t.id)));
    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": getSessionId(),
        },
        body: JSON.stringify({ transactions: targets }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          results: { id: string; category: TxCategory; vat: VatRate }[];
        };
        const byId = new Map(data.results.map((r) => [r.id, r]));
        setRows((prev) =>
          prev.map((row) => {
            if (row.category) return row;
            const ai = byId.get(row.id);
            return ai ? { ...row, category: ai.category, vat: ai.vat } : row;
          })
        );
        setAiDoneCount(data.results.length);
        setTimeout(() => setAiDoneCount(0), 4000);
      }
    } catch {
      // silent — table just stays uncategorized, user can retry
    } finally {
      setAiProgress(100);
      setTimeout(() => {
        setAiPending(false);
        setAiProgress(0);
        setPendingAiIds(new Set());
      }, 600);
    }
  }

  function handleBatchCategorize() {
    const targets = rows
      .filter((r) => !r.category)
      .map((r) => ({ id: r.id, label: r.label, amount: r.amount }));
    runBackgroundAI(targets);
  }

  // ── build import hint label ────────────────────────────────────────────────
  const importHint = useMemo(() => {
    if (!importTarget) return undefined;
    const acc = coverage.find((a) => a.id === importTarget.accountId);
    const monthName = new Date(importTarget.year, importTarget.month - 1).toLocaleDateString(
      "fr-FR",
      { month: "long" }
    );
    return acc
      ? `${acc.name} · ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${importTarget.year}`
      : undefined;
  }, [importTarget, coverage]);

  return (
    <>
      <Topbar title="Transactions bancaires" subtitle={`Exercice ${company.activeYear} · 2 comptes`} />

      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-0 border-b bg-card px-6">
        <PageTab active={tab === "transactions"} onClick={() => setTab("transactions")}>
          Transactions
          <TabPill>{counts.all}</TabPill>
        </PageTab>
        <PageTab active={tab === "releves"} onClick={() => setTab("releves")}>
          Relevés bancaires
          {totalMissing > 0 ? (
            <TabPill tone="warning">{totalMissing}</TabPill>
          ) : (
            <TabPill tone="success">✓</TabPill>
          )}
        </PageTab>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="bg-paper flex-1 space-y-4 p-6">
        {tab === "transactions" && (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <FilterTab
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                  label="Toutes"
                  count={counts.all}
                />
                <FilterTab
                  active={filter === "uncategorized"}
                  onClick={() => setFilter("uncategorized")}
                  label="À catégoriser"
                  count={counts.uncategorized}
                  tone="warning"
                />
                <FilterTab
                  active={filter === "categorized"}
                  onClick={() => setFilter("categorized")}
                  label="Catégorisées"
                  count={counts.categorized}
                  tone="success"
                />
              </div>
              <div className="flex items-center gap-2">
                {counts.uncategorized > 0 && !aiPending && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchCategorize}
                  >
                    <Sparkles className="size-4" />
                    Catégoriser {counts.uncategorized} transactions
                  </Button>
                )}
                <Button size="sm" onClick={() => { setImportTarget(null); setImportOpen(true); }}>
                  <Upload className="size-4" />
                  Importer un relevé
                </Button>
              </div>
            </div>

            {/* AI in-progress banner */}
            {aiPending && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/8 px-4 py-3">
                {/* Stacked spinner + sparkles icon */}
                <div className="relative flex size-8 shrink-0 items-center justify-center">
                  <Loader2 className="absolute size-8 animate-spin text-primary/30" />
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Analyse IA en cours…</p>
                  <p className="text-xs text-primary/70">
                    Catégorisation de <strong>{pendingAiIds.size}</strong> transaction{pendingAiIds.size > 1 ? "s" : ""} · Identification des taux de TVA
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
                  <span className="tnum font-mono text-xs font-semibold text-primary">
                    {Math.round(aiProgress)}%
                  </span>
                  <div className="h-1.5 w-36 overflow-hidden rounded-full bg-primary/15">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${aiProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AI done flash */}
            {aiDoneCount > 0 && !aiPending && (
              <div className="flex items-center gap-3 rounded-lg border border-success/25 bg-success/8 px-4 py-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                <span className="text-sm font-medium text-success">
                  IA · {aiDoneCount} transaction{aiDoneCount > 1 ? "s" : ""} catégorisée{aiDoneCount > 1 ? "s" : ""} automatiquement
                </span>
                <button
                  type="button"
                  onClick={() => setAiDoneCount(0)}
                  className="ml-auto text-success/60 hover:text-success"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* Transaction table */}
            <Card className="relative overflow-hidden">
              {/* Thin top progress bar on the card itself */}
              {aiPending && (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Libellé</TableHead>
                    <TableHead className="hidden lg:table-cell">Compte</TableHead>
                    <TableHead>Pièce</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((t) => (
                    <TableRow
                      key={t.id}
                      className={cn(
                        "cursor-pointer",
                        pendingAiIds.has(t.id) && "bg-primary/[0.03]"
                      )}
                      onClick={() => setSelectedTx(t)}
                    >
                      <TableCell className="tnum whitespace-nowrap font-mono text-xs text-muted-foreground">
                        {formatDate(t.date)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="min-w-0">
                            <p className="font-medium">{t.label}</p>
                            <p className="font-mono text-xs text-muted-foreground">{t.reference}</p>
                          </div>
                          {t.verified && (
                            <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground lg:table-cell">
                        {t.account}
                      </TableCell>

                      <TableCell>
                        {t.matched ? (
                          <Badge variant="default">
                            <Link2 className="size-3" />
                            Liée
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <Link2Off className="size-3" />
                            Aucune
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {pendingAiIds.has(t.id) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            <Loader2 className="size-3.5 animate-spin" />
                            Analyse IA…
                          </span>
                        ) : t.category ? (
                          <Badge variant="success">
                            <CheckCircle2 className="size-3" />
                            {CATEGORY_LABELS[t.category]}
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <CircleHelp className="size-3" />À catégoriser
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {t.vat ? (
                          <span className="tnum font-mono text-xs text-muted-foreground">
                            {getVatLabel(t.vat)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-dashed border-warning/60 bg-warning/8 px-2 py-0.5 text-xs font-medium text-warning-foreground">
                            Définir TVA
                          </span>
                        )}
                      </TableCell>

                      <TableCell
                        className={cn(
                          "tnum whitespace-nowrap text-right font-mono font-medium",
                          t.amount > 0 ? "text-success" : "text-foreground"
                        )}
                      >
                        {t.amount > 0 ? "+" : ""}
                        {formatMAD(t.amount)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {visible.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Aucune transaction dans cette vue.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </>
        )}

        {tab === "releves" && (
          <RelevesTab
            coverage={visibleCoverage}
            year={relevesYear}
            availableYears={availableYears}
            onYearChange={handleYearChange}
            onImportRequest={handleImportRequest}
          />
        )}
      </div>

      {/* ── Overlays ────────────────────────────────────────────────────────── */}
      <TransactionDrawer
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
        onSave={handleSave}
      />

      {importOpen && (
        <ImportModal
          hint={importHint}
          onClose={() => { setImportOpen(false); setImportTarget(null); }}
          onImport={handleImport}
        />
      )}
    </>
  );
}

// ── Small UI components ──────────────────────────────────────────────────────

function PageTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
        active
          ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function TabPill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <span
      className={cn(
        "tnum rounded-full px-1.5 py-0.5 text-xs font-semibold",
        tone === "warning" && "bg-warning/15 text-warning-foreground",
        tone === "success" && "bg-success/12 text-success",
        tone === "default" && "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
  tone = "default",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {label}
      <span
        className={cn(
          "tnum rounded-full px-1.5 text-xs font-semibold",
          active
            ? "bg-white/20 text-white"
            : tone === "warning"
              ? "bg-warning/15 text-warning-foreground"
              : tone === "success"
                ? "bg-success/12 text-success"
                : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  );
}
