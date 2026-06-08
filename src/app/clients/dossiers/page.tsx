"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, CheckCircle2, AlertTriangle, AlertCircle, Search, Clock } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  accountingClients, dossierObligations, getTemplate,
  type AccountingClient, type DossierObligation,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const TODAY = new Date("2026-06-08");
function isOverdue(d: string) { return new Date(d) < TODAY; }
type Health = "green" | "amber" | "red";
type FilterKey = "all" | "green" | "amber" | "red";

function getHealth(clientId: string, obs: DossierObligation[], client: AccountingClient): Health {
  if (client.status === "pending_invite") return "red";
  const co = obs.filter((o) => o.clientId === clientId);
  if (co.some((o) => o.status !== "done" && o.status !== "na" && isOverdue(o.dueDate))) return "red";
  if (co.some((o) => o.status === "pending")) return "amber";
  return "green";
}

function getOverdueCount(clientId: string, obs: DossierObligation[]) {
  return obs.filter(
    (o) => o.clientId === clientId && o.status !== "done" && o.status !== "na" && isOverdue(o.dueDate)
  ).length;
}


export default function DossiersPage() {
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<FilterKey>("all");

  const obs = dossierObligations;

  const counts = useMemo(() => ({
    all:   accountingClients.length,
    green: accountingClients.filter((c) => getHealth(c.id, obs, c) === "green").length,
    amber: accountingClients.filter((c) => getHealth(c.id, obs, c) === "amber").length,
    red:   accountingClients.filter((c) => getHealth(c.id, obs, c) === "red").length,
  }), [obs]);

  const rows = useMemo(() => {
    return accountingClients
      .filter((c) => {
        if (filter !== "all" && getHealth(c.id, obs, c) !== filter) return false;
        const q = search.toLowerCase();
        return (
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.activity.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const order: Record<Health, number> = { red: 0, amber: 1, green: 2 };
        return order[getHealth(a.id, obs, a)] - order[getHealth(b.id, obs, b)];
      });
  }, [search, filter, obs]);

  return (
    <>
      <Topbar title="Dossiers" subtitle={`${accountingClients.length} clients · exercice 2026`} initials="AB" />
      <div className="space-y-4 p-6">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <FilterTab active={filter === "all"}   onClick={() => setFilter("all")}   label="Tous"       count={counts.all}   />
            <FilterTab active={filter === "green"} onClick={() => setFilter("green")} label="À jour"     count={counts.green} tone="success" />
            <FilterTab active={filter === "amber"} onClick={() => setFilter("amber")} label="En cours"   count={counts.amber} tone="warning" />
            <FilterTab active={filter === "red"}   onClick={() => setFilter("red")}   label="En retard"  count={counts.red}   tone="danger"  />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 pl-8 text-sm"
              />
            </div>
            <Button size="sm" onClick={() => router.push("/clients/new")}>
              <UserPlus className="size-4" />
              Nouveau dossier
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Client</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Modèle fiscal</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((client) => {
                const health  = getHealth(client.id, obs, client);
                const overdue = getOverdueCount(client.id, obs);
                const tmpl    = getTemplate(client.templateId);

                return (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    {/* Client */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                          {client.initials}
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="font-mono text-xs text-muted-foreground">{client.legalForm}</p>
                        </div>
                        {client.status === "pending_invite" && (
                          <Badge variant="secondary" className="text-[10px]">Invitation en attente</Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Ville */}
                    <TableCell className="text-sm text-muted-foreground">
                      {client.city}
                    </TableCell>

                    {/* Modèle */}
                    <TableCell className="text-sm text-muted-foreground">
                      {tmpl?.name ?? "—"}
                    </TableCell>

                    {/* Statut */}
                    <TableCell>
                      {health === "green" && (
                        <Badge variant="success">
                          <CheckCircle2 className="size-3" />À jour
                        </Badge>
                      )}
                      {health === "amber" && (
                        <Badge variant="warning">
                          <Clock className="size-3" />À venir
                        </Badge>
                      )}
                      {health === "red" && (
                        <Badge variant="destructive">
                          <AlertTriangle className="size-3" />{overdue > 1 ? `${overdue} en retard` : "En retard"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Aucun dossier ne correspond à votre recherche.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

      </div>
    </>
  );
}

// ── FilterTab ─────────────────────────────────────────────────────────────────

function FilterTab({
  active, onClick, label, count, tone = "default",
}: {
  active: boolean; onClick: () => void; label: string; count: number;
  tone?: "default" | "warning" | "success" | "danger";
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
      <span className={cn(
        "tnum rounded-full px-1.5 text-xs font-semibold",
        active
          ? "bg-white/20 text-white"
          : tone === "warning" ? "bg-amber-100 text-amber-700"
          : tone === "success" ? "bg-emerald-100 text-emerald-700"
          : tone === "danger"  ? "bg-red-100 text-red-700"
          : "bg-muted text-muted-foreground"
      )}>
        {count}
      </span>
    </button>
  );
}
