"use client";

import { useState } from "react";
import { Copy, Check, CalendarDays, Pencil, Save, X, Lock, Unlock, Plus } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { company, fiscalYears as seedYears, type FiscalYear } from "@/lib/mock-data";

export default function CompanySettingsPage() {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    name: company.name,
    legalForm: company.legalForm,
    address: company.address,
    city: company.city,
    activity: company.activity,
    taxMode: company.taxMode,
    vatRegime: company.vatRegime,
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [years, setYears] = useState<FiscalYear[]>(seedYears);

  const openYear = years.find((y) => y.status === "open");

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function setActiveYear(year: number) {
    setYears((prev) =>
      prev.map((y) => ({
        ...y,
        status: y.year === year ? "open" : y.year < year ? "closed" : "future",
      }))
    );
  }

  function addNextYear() {
    const last = Math.max(...years.map((y) => y.year));
    const next = last + 1;
    setYears((prev) => [
      ...prev.map((y) => ({ ...y, status: "closed" as const })),
      {
        year: next,
        start: `${next}-01-01`,
        end: `${next}-12-31`,
        status: "open" as const,
      },
    ]);
  }

  return (
    <>
      <Topbar
        title="Ma société"
        subtitle={openYear ? `Exercice ouvert · ${openYear.year}` : "Aucun exercice ouvert"}
      />

      <div className="bg-paper flex-1 space-y-6 p-6">
        {/* Company header card */}
        <Card className="overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 via-accent to-primary/10" />
          <CardContent className="flex items-end gap-4 px-6 pb-5 pt-0 -mt-8">
            <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-background bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
              {company.initials}
            </div>
            <div className="min-w-0 pb-1">
              {editing ? (
                <input
                  value={fields.name}
                  onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
                  className="mb-1 w-full border-b border-primary bg-transparent text-xl font-bold focus:outline-none"
                />
              ) : (
                <p className="text-xl font-bold leading-tight">{fields.name}</p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{fields.legalForm}</Badge>
                <span className="text-xs text-muted-foreground">{fields.city}</span>
              </div>
            </div>
            <div className="ml-auto flex shrink-0 gap-2">
              {editing ? (
                <>
                  <Button size="sm" onClick={() => setEditing(false)}>
                    <Save className="size-4" />
                    Sauvegarder
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="size-4" />
                  Modifier
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Exercices fiscaux ──────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-muted-foreground" />
                Exercices fiscaux
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addNextYear}>
                <Plus className="size-4" />
                Nouvel exercice
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y pt-0">
            {[...years].reverse().map((fy) => (
              <div key={fy.year} className="flex items-center gap-4 py-3.5">
                {/* Year + dates */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-sm font-semibold">
                  {fy.year}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Exercice {fy.year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(fy.start)} — {formatDate(fy.end)}
                  </p>
                </div>

                {/* Status badge */}
                {fy.status === "open" && (
                  <Badge variant="default" className="gap-1.5">
                    <Unlock className="size-3" />
                    Ouvert
                  </Badge>
                )}
                {fy.status === "closed" && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Lock className="size-3" />
                    Clôturé
                  </Badge>
                )}

                {/* Actions */}
                {fy.status === "closed" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => setActiveYear(fy.year)}
                    title={`Rouvrir l'exercice ${fy.year}`}
                  >
                    Rouvrir
                  </Button>
                )}
                {fy.status === "open" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={() =>
                      setYears((prev) =>
                        prev.map((y) =>
                          y.year === fy.year ? { ...y, status: "closed" } : y
                        )
                      )
                    }
                    title="Clôturer cet exercice"
                  >
                    Clôturer
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Identification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Identification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <FieldRow
                label="ICE"
                value={company.ice}
                copyable
                onCopy={() => copyToClipboard(company.ice, "ice")}
                copied={copied === "ice"}
              />
              <FieldRow
                label="Identifiant Fiscal (IF)"
                value={company.identifiantFiscal}
                copyable
                onCopy={() => copyToClipboard(company.identifiantFiscal, "if")}
                copied={copied === "if"}
              />
              <FieldRow label="RC" value={company.rc} />
              <FieldRow label="CNSS" value={company.cnss} />
              <FieldRow
                label="Forme juridique"
                value={fields.legalForm}
                editing={editing}
                onChange={(v) => setFields((f) => ({ ...f, legalForm: v }))}
              />
              <FieldRow
                label="Adresse"
                value={`${fields.address}, ${fields.city}`}
                editing={editing}
                onChange={(v) => setFields((f) => ({ ...f, address: v }))}
              />
            </CardContent>
          </Card>

          {/* Fiscalité */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Fiscalité et activité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <FieldRow
                label="Régime d'imposition"
                value={fields.taxMode}
                editing={editing}
                onChange={(v) => setFields((f) => ({ ...f, taxMode: v }))}
              />
              <FieldRow
                label="Régime de TVA"
                value={fields.vatRegime}
                editing={editing}
                onChange={(v) => setFields((f) => ({ ...f, vatRegime: v }))}
              />
              <FieldRow
                label="Secteur d'activité"
                value={`${fields.activity} (${company.activityCode})`}
                editing={editing}
                onChange={(v) => setFields((f) => ({ ...f, activity: v }))}
              />
              <FieldRow
                label="Date de début d'activité"
                value={formatDate(company.startDate)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function FieldRow({
  label,
  value,
  copyable,
  onCopy,
  copied,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  copied?: boolean;
  editing?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="w-48 shrink-0 text-sm text-muted-foreground">{label}</span>
      {editing && onChange ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-input bg-muted/40 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <span className="flex-1 text-sm font-medium">{value}</span>
      )}
      {copyable && (
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "flex size-6 items-center justify-center rounded transition-colors hover:bg-muted",
            copied ? "text-success" : "text-muted-foreground"
          )}
          title="Copier"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      )}
    </div>
  );
}
