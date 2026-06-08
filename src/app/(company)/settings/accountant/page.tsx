"use client";

import { useState } from "react";
import { Briefcase, Copy, Check, Link2, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Mock linked accountant ────────────────────────────────────────────────────

const LINKED_ACCOUNTANT = {
  name: "Cabinet Benjelloun & Associés",
  contact: "Abdellatif Benjelloun",
  email: "a.benjelloun@cabinet-bja.ma",
  phone: "+212 522 347 890",
  linkedSince: "2024-01-15",
  permissions: ["Lecture", "Validation factures", "Dépenses", "Relevés bancaires"],
};

const INVITE_CODE = "ARGAN-2026-X7K9";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-MA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountantSettingsPage() {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(INVITE_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Topbar title="Accès comptable" subtitle="Gérez l'accès de votre cabinet comptable" />

      <div className="flex-1 overflow-y-auto bg-paper">
        <div className="mx-auto max-w-2xl space-y-6 p-6">

          {/* ── Linked accountant card ── */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Comptable lié
            </h2>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      BJ
                    </div>
                    <div>
                      <p className="font-semibold">{LINKED_ACCOUNTANT.name}</p>
                      <p className="text-sm text-muted-foreground">{LINKED_ACCOUNTANT.contact}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {LINKED_ACCOUNTANT.email}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {LINKED_ACCOUNTANT.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="gap-1 text-xs">
                      <ShieldCheck className="size-3" />
                      Actif
                    </Badge>
                    <Button variant="ghost" size="icon" className="size-7">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4 text-xs text-muted-foreground">
                  Lié depuis le {formatDate(LINKED_ACCOUNTANT.linkedSince)}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── Permissions ── */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Droits d&apos;accès accordés
            </h2>
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-2">
                  {LINKED_ACCOUNTANT.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200"
                    >
                      <Check className="size-3" />
                      {perm}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Votre comptable peut consulter et valider vos pièces justificatives, mais ne peut pas
                  modifier les paramètres de votre société ni effectuer de virements.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* ── Invitation code ── */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Code d&apos;invitation
            </h2>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Partagez ce code avec un autre cabinet comptable pour leur permettre de rejoindre
                  votre dossier. Le code expire dans 30 jours.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex flex-1 items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                    <Link2 className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 font-mono text-sm font-semibold tracking-widest">
                      {INVITE_CODE}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    className={cn(copied && "text-emerald-600 border-emerald-300")}
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ── No accountant state (hidden in this demo since one is linked) ── */}
          <section className="hidden">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                  <Briefcase className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Aucun comptable lié</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Invitez votre cabinet comptable pour collaborer sur vos pièces.
                  </p>
                </div>
                <Button>
                  <Link2 className="size-4" />
                  Générer un lien d&apos;invitation
                </Button>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </>
  );
}
