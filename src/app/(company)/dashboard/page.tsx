import Link from "next/link";
import {
  Landmark,
  FileInput,
  FileOutput,
  ArrowUpRight,
  ArrowDownRight,
  CircleHelp,
  CheckCircle2,
  ArrowRight,
  Tag,
  FileWarning,
  Receipt,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bankTransactions,
  supplierInvoices,
  customerInvoices,
  bankAccountCoverage,
  bankAccounts,
  company,
  CATEGORY_LABELS,
} from "@/lib/mock-data";
import { formatMAD, formatDate, cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

type TaskStatus = "overdue" | "todo";

interface Task {
  id: string;
  status: TaskStatus;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
}

export default function DashboardPage() {
  // ── Derived numbers ────────────────────────────────────────────────────────
  const totalBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);
  const inflow = bankTransactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outflow = bankTransactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);

  const uncategorizedCount = bankTransactions.filter((t) => !t.category).length;
  const supplierToValidate = supplierInvoices.filter((i) => i.status === "draft").length;
  const overdueCustomers = customerInvoices.filter((i) => i.status === "overdue");
  const missingReleves = bankAccountCoverage.flatMap((acc) =>
    acc.statements
      .filter((s) => s.status === "missing")
      .map((s) => ({ ...s, accountName: acc.name, accountId: acc.id }))
  );

  // ── Build task list ────────────────────────────────────────────────────────
  const tasks: Task[] = [
    ...missingReleves.map((r) => ({
      id: `releve-${r.accountId}-${r.month}`,
      status: "overdue" as const,
      icon: <FileWarning className="size-5 text-destructive" />,
      title: "Relevé bancaire manquant",
      description: `${r.accountName} · ${MONTH_NAMES[r.month - 1]} ${r.year}`,
      href: "/bank-transactions",
      ctaLabel: "Importer",
    })),
    ...(uncategorizedCount > 0
      ? [
          {
            id: "uncategorized",
            status: "todo" as const,
            icon: <Tag className="size-5 text-warning-foreground" />,
            title: `${uncategorizedCount} transaction${uncategorizedCount > 1 ? "s" : ""} à catégoriser`,
            description: "Catégorisez avec l'IA en un clic",
            href: "/bank-transactions",
            ctaLabel: "Catégoriser",
          },
        ]
      : []),
    ...(supplierToValidate > 0
      ? [
          {
            id: "supplier-validate",
            status: "todo" as const,
            icon: <FileInput className="size-5 text-warning-foreground" />,
            title: `${supplierToValidate} facture${supplierToValidate > 1 ? "s" : ""} fournisseur à valider`,
            description: "En attente de validation avant comptabilisation",
            href: "/supplier-invoices",
            ctaLabel: "Valider",
          },
        ]
      : []),
    ...(overdueCustomers.length > 0
      ? [
          {
            id: "overdue-customers",
            status: "overdue" as const,
            icon: <Receipt className="size-5 text-destructive" />,
            title: `${overdueCustomers.length} facture${overdueCustomers.length > 1 ? "s" : ""} client impayée${overdueCustomers.length > 1 ? "s" : ""}`,
            description: `${formatMAD(overdueCustomers.reduce((s, i) => s + i.total, 0))} en retard de paiement`,
            href: "/customer-invoices",
            ctaLabel: "Relancer",
          },
        ]
      : []),
  ];

  const recent = bankTransactions.slice(0, 5);

  return (
    <>
      <Topbar
        title="Tableau de bord"
        subtitle={`Exercice ${company.activeYear} · ${tasks.length > 0 ? `${tasks.length} action${tasks.length > 1 ? "s" : ""} en attente` : "Tout est à jour"}`}
      />

      <div className="bg-paper flex-1 space-y-6 p-6">
        {/* ── KPI strip ──────────────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Solde bancaire"
            value={formatMAD(totalBalance)}
            icon={<Landmark className="size-4" />}
            tone="default"
          />
          <KpiCard
            label="Encaissements"
            value={formatMAD(inflow)}
            icon={<ArrowDownRight className="size-4" />}
            tone="success"
          />
          <KpiCard
            label="Décaissements"
            value={formatMAD(Math.abs(outflow))}
            icon={<ArrowUpRight className="size-4" />}
            tone="default"
          />
          <KpiCard
            label="Encours clients"
            value={formatMAD(overdueCustomers.reduce((s, i) => s + i.total, 0))}
            icon={<FileOutput className="size-4" />}
            tone={overdueCustomers.length > 0 ? "warning" : "default"}
            sub={overdueCustomers.length > 0 ? `${overdueCustomers.length} facture${overdueCustomers.length > 1 ? "s" : ""} impayée${overdueCustomers.length > 1 ? "s" : ""}` : "À jour"}
          />
        </div>

        {/* ── À faire ────────────────────────────────────────────────────────── */}
        <div>
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="text-base font-semibold">À faire</h2>
            {tasks.length > 0 ? (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning-foreground">
                {tasks.length} action{tasks.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success">
                Tout est à jour
              </span>
            )}
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-success/12">
                  <CheckCircle2 className="size-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-success">Aucune action requise</p>
                  <p className="text-sm text-muted-foreground">
                    Tous les relevés sont importés, toutes les transactions catégorisées.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* ── Recent transactions ─────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between border-b px-5 py-3.5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Landmark className="size-4 text-muted-foreground" />
              Dernières transactions
            </p>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link href="/bank-transactions">Tout voir</Link>
            </Button>
          </div>
          <div className="divide-y">
            {recent.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    t.amount > 0
                      ? "bg-success/12 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {t.amount > 0 ? (
                    <ArrowDownRight className="size-3.5" />
                  ) : (
                    <ArrowUpRight className="size-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                </div>
                {t.category ? (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    <CheckCircle2 className="size-3" />
                    {CATEGORY_LABELS[t.category]}
                  </Badge>
                ) : (
                  <Badge variant="warning" className="hidden sm:inline-flex">
                    <CircleHelp className="size-3" />
                    À catégoriser
                  </Badge>
                )}
                <span
                  className={cn(
                    "tnum w-28 shrink-0 text-right font-mono text-sm font-medium",
                    t.amount > 0 ? "text-success" : ""
                  )}
                >
                  {t.amount > 0 ? "+" : ""}
                  {formatMAD(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ── Components ───────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  tone,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "default" | "success" | "warning";
  sub?: string;
}) {
  const iconClass =
    tone === "success"
      ? "bg-success/12 text-success"
      : tone === "warning"
        ? "bg-warning/15 text-warning-foreground"
        : "bg-primary/10 text-primary";
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className={cn("flex size-8 items-center justify-center rounded-md", iconClass)}>
            {icon}
          </span>
        </div>
        <p className="tnum mt-3 font-mono text-2xl font-semibold tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function TaskCard({ task }: { task: Task }) {
  const cfg = {
    overdue: {
      badge: "border-destructive/30 bg-destructive/8 text-destructive",
      label: "En retard",
      iconBg: "bg-destructive/8",
      border: "border-destructive/20",
      cta: "default" as const,
    },
    todo: {
      badge: "border-warning/30 bg-warning/8 text-warning-foreground",
      label: "À faire",
      iconBg: "bg-warning/8",
      border: "border-border",
      cta: "outline" as const,
    },
  }[task.status];

  return (
    <Card className={cn("flex flex-col transition-shadow hover:shadow-sm", cfg.border)}>
      <CardContent className="flex flex-1 flex-col p-5">
        {/* Status badge */}
        <span
          className={cn(
            "mb-4 self-start rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            cfg.badge
          )}
        >
          {cfg.label}
        </span>

        {/* Icon + text */}
        <div className="flex flex-1 items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              cfg.iconBg
            )}
          >
            {task.icon}
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-snug">{task.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{task.description}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-5 border-t pt-4">
          <Button asChild size="sm" variant={cfg.cta}>
            <Link href={task.href}>
              {task.ctaLabel}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
