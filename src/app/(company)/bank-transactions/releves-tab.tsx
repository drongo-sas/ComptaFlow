"use client";

import { CheckCircle2, AlertTriangle, Upload, Landmark, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { company, type BankAccountCoverage, type AccountStatement } from "@/lib/mock-data";

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

interface Props {
  coverage: BankAccountCoverage[];
  year: number;
  availableYears: number[];
  onYearChange: (y: number) => void;
  onImportRequest: (accountId: string, month: number, year: number) => void;
}

export function RelevesTab({ coverage, year, availableYears, onYearChange, onImportRequest }: Props) {
  const totalMissing = coverage.reduce(
    (n, acc) => n + acc.statements.filter((s) => s.status === "missing").length,
    0
  );
  const totalImported = coverage.reduce(
    (n, acc) => n + acc.statements.filter((s) => s.status === "imported").length,
    0
  );
  const totalApplicable = coverage.reduce(
    (n, acc) => n + acc.statements.filter((s) => s.status !== "future").length,
    0
  );

  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears);
  const isActiveYear = year === company.activeYear;

  return (
    <div className="space-y-5">
      {/* Exercice header with year navigator */}
      <div className="flex items-center gap-3">
        <CalendarDays className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Relevés bancaires</span>

        {/* Year pill navigator */}
        <div className="flex items-center rounded-full border border-border bg-card shadow-sm">
          <button
            type="button"
            disabled={year <= minYear}
            onClick={() => onYearChange(year - 1)}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            title="Exercice précédent"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="tnum px-2 font-mono text-sm font-semibold">{year}</span>
          <button
            type="button"
            disabled={year >= maxYear}
            onClick={() => onYearChange(year + 1)}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            title="Exercice suivant"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <Badge variant={isActiveYear ? "default" : "secondary"}>
          {isActiveYear ? "exercice ouvert" : "exercice clôturé"}
        </Badge>
      </div>

      {/* Summary banner */}
      {totalMissing > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-warning-foreground" />
          <span className="text-warning-foreground">
            <strong>
              {totalMissing} relevé{totalMissing > 1 ? "s" : ""} manquant
              {totalMissing > 1 ? "s" : ""}
            </strong>
            {" — "}cliquez sur une cellule amber pour importer le relevé correspondant.
          </span>
          <span className="ml-auto shrink-0 text-xs font-medium text-warning-foreground/70">
            {totalImported}/{totalApplicable} mois couverts
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm">
          <CheckCircle2 className="size-4 shrink-0 text-success" />
          <span className="text-success font-medium">
            Tous les relevés sont à jour — {totalImported} mois importés.
          </span>
        </div>
      )}

      {/* One card per account */}
      {coverage.map((account) => {
        const imported = account.statements.filter((s) => s.status === "imported").length;
        const applicable = account.statements.filter((s) => s.status !== "future").length;
        const missing = account.statements.filter((s) => s.status === "missing").length;
        const pct = applicable > 0 ? (imported / applicable) * 100 : 0;

        return (
          <Card key={account.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                {/* Account identity */}
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Landmark className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.bank}</p>
                  </div>
                </div>

                {/* Coverage summary */}
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      missing > 0 ? "text-warning-foreground" : "text-success"
                    )}
                  >
                    {imported}/{applicable} mois
                  </p>
                  {missing > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {missing} manquant{missing > 1 ? "s" : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-success">à jour</p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    missing > 0 ? "bg-warning" : "bg-success"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </CardHeader>

            <CardContent className="pt-3">
              {/* Month cells — scrollable on small screens */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {account.statements.map((stmt) => (
                  <MonthCell
                    key={`${stmt.year}-${stmt.month}`}
                    stmt={stmt}
                    onImport={
                      stmt.status === "missing"
                        ? () => onImportRequest(account.id, stmt.month, stmt.year)
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-success/40" />
                  Importé
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-warning/40" />
                  Manquant — cliquer pour importer
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-muted" />
                  Période future
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MonthCell({
  stmt,
  onImport,
}: {
  stmt: AccountStatement;
  onImport?: () => void;
}) {
  const label = MONTHS[stmt.month - 1];

  if (stmt.status === "future") {
    return (
      <div className="flex min-w-[52px] flex-col items-center gap-1.5 rounded-lg px-2 py-2.5">
        <span className="text-xs font-medium text-muted-foreground/40">{label}</span>
        <span className="text-[10px] text-muted-foreground/30">—</span>
      </div>
    );
  }

  if (stmt.status === "imported") {
    const dateHint = stmt.importedAt
      ? `Importé le ${new Date(stmt.importedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`
      : "Importé";
    return (
      <div
        title={dateHint}
        className="flex min-w-[52px] flex-col items-center gap-1.5 rounded-lg border border-success/25 bg-success/10 px-2 py-2.5"
      >
        <span className="text-xs font-semibold text-success">{label}</span>
        <CheckCircle2 className="size-3.5 text-success" />
      </div>
    );
  }

  // Missing — hoverable upload trigger
  return (
    <button
      type="button"
      onClick={onImport}
      title={`Importer le relevé de ${label}`}
      className="group flex min-w-[52px] flex-col items-center gap-1.5 rounded-lg border border-warning/40 bg-warning/10 px-2 py-2.5 transition-all hover:border-primary/50 hover:bg-primary/10 hover:shadow-sm"
    >
      <span className="text-xs font-semibold text-warning-foreground transition-colors group-hover:text-primary">
        {label}
      </span>
      {/* Show warning icon normally, upload icon on hover */}
      <AlertTriangle className="size-3.5 text-warning-foreground transition-all group-hover:hidden" />
      <Upload className="hidden size-3.5 text-primary group-hover:block" />
    </button>
  );
}
