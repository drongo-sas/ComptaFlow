"use client";

import { useState } from "react";
import { UserPlus, Mail, Phone, Shield, Pencil } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MEMBERS = [
  {
    id: "m1", name: "Abdellatif Benjelloun", initials: "AB",
    role: "Associé", email: "a.benjelloun@cabinet.ma", phone: "+212 661 234 567",
    dossiers: 5, status: "active", color: "bg-primary",
    permissions: ["Tous les dossiers", "Facturation", "Paramètres"],
  },
  {
    id: "m2", name: "Nadia El Fassi", initials: "NF",
    role: "Collaboratrice", email: "n.elfassi@cabinet.ma", phone: "+212 662 345 678",
    dossiers: 8, status: "active", color: "bg-violet-500",
    permissions: ["Dossiers assignés", "Lecture seule"],
  },
  {
    id: "m3", name: "Karim Ouali", initials: "KO",
    role: "Collaborateur", email: "k.ouali@cabinet.ma", phone: "+212 663 456 789",
    dossiers: 6, status: "active", color: "bg-sky-500",
    permissions: ["Dossiers assignés"],
  },
  {
    id: "m4", name: "Salma Tahiri", initials: "ST",
    role: "Stagiaire", email: "s.tahiri@cabinet.ma", phone: "+212 664 567 890",
    dossiers: 2, status: "active", color: "bg-teal-500",
    permissions: ["Lecture seule"],
  },
  {
    id: "m5", name: "Omar Benali", initials: "OB",
    role: "Collaborateur", email: "o.benali@cabinet.ma", phone: "",
    dossiers: 0, status: "invited", color: "bg-zinc-400",
    permissions: [],
  },
];

const ROLE_COLORS: Record<string, string> = {
  "Associé":       "bg-primary/10 text-primary",
  "Collaboratrice":"bg-violet-100 text-violet-700",
  "Collaborateur": "bg-sky-100 text-sky-700",
  "Stagiaire":     "bg-teal-100 text-teal-700",
};

export default function TeamPage() {
  const [members] = useState(MEMBERS);

  const activeCount = members.filter((m) => m.status === "active").length;

  return (
    <>
      <Topbar title="Équipe" subtitle={`${activeCount} membres actifs`} initials="AB" />
    <div className="px-6 py-6">

      {/* ── Action row ── */}
      <div className="mb-5 flex justify-end">
        <Button size="sm">
          <UserPlus className="size-4" />
          Inviter un membre
        </Button>
      </div>

      {/* ── Members list ── */}
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex flex-wrap items-center gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm"
          >
            {/* Avatar */}
            <div className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
              member.color
            )}>
              {member.initials}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{member.name}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  ROLE_COLORS[member.role] ?? "bg-muted text-muted-foreground"
                )}>
                  {member.role}
                </span>
                {member.status === "invited" && (
                  <Badge variant="secondary" className="text-[10px]">Invitation envoyée</Badge>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-4 text-xs text-muted-foreground">
                {member.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="size-3" />{member.email}
                  </span>
                )}
                {member.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" />{member.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Stats + permissions */}
            <div className="hidden shrink-0 items-center gap-4 sm:flex">
              {member.dossiers > 0 && (
                <div className="text-right">
                  <p className="text-sm font-semibold">{member.dossiers}</p>
                  <p className="text-[10px] text-muted-foreground">dossiers</p>
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {member.permissions.slice(0, 2).map((p) => (
                  <span key={p} className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    <Shield className="size-2.5" />{p}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <Pencil className="size-3.5" />
                Modifier
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Permissions info ── */}
      <div className="mt-8 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Shield className="size-4 text-primary" />
          Niveaux d&apos;accès
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { role: "Associé", desc: "Accès complet — tous les dossiers, paramètres, facturation", icon: "🔑" },
            { role: "Collaborateur", desc: "Dossiers assignés uniquement — saisie et validation", icon: "📁" },
            { role: "Stagiaire", desc: "Lecture seule sur les dossiers assignés", icon: "👁" },
          ].map((item) => (
            <div key={item.role} className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium">{item.icon} {item.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
