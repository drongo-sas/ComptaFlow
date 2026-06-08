"use client";

import { useState } from "react";
import { Building2, Bell, Palette, Shield, Save } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Section types ──────────────────────────────────────────────────────────────

type Section = "cabinet" | "notifications" | "appearance" | "security";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "cabinet",       label: "Cabinet",       icon: <Building2 className="size-4" />, desc: "Informations du cabinet" },
  { id: "notifications", label: "Notifications", icon: <Bell className="size-4" />,      desc: "Alertes et rappels" },
  { id: "appearance",    label: "Apparence",     icon: <Palette className="size-4" />,   desc: "Thème et affichage" },
  { id: "security",      label: "Sécurité",      icon: <Shield className="size-4" />,    desc: "Mot de passe et accès" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("cabinet");
  const [saved, setSaved]   = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <Topbar title="Paramètres" subtitle="Gérez votre cabinet et vos préférences" initials="AB" />
    <div className="px-6 py-6">

      <div className="flex gap-6">

        {/* ── Nav ── */}
        <nav className="w-48 shrink-0 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                active === s.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </nav>

        {/* ── Panel ── */}
        <div className="flex-1">
          {active === "cabinet"       && <CabinetSection onSave={handleSave} saved={saved} />}
          {active === "notifications" && <NotificationsSection onSave={handleSave} saved={saved} />}
          {active === "appearance"    && <AppearanceSection onSave={handleSave} saved={saved} />}
          {active === "security"      && <SecuritySection onSave={handleSave} saved={saved} />}
        </div>

      </div>
    </div>
    </>
  );
}

// ── Cabinet section ────────────────────────────────────────────────────────────

function CabinetSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <Card title="Informations du cabinet">
      <Field label="Nom du cabinet">
        <Input defaultValue="Cabinet Benjelloun & Associés" />
      </Field>
      <Field label="Adresse">
        <Input defaultValue="12 Rue Moulay Youssef, Casablanca" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Téléphone">
          <Input defaultValue="+212 522 345 678" />
        </Field>
        <Field label="Email professionnel">
          <Input defaultValue="contact@benjelloun-cpa.ma" />
        </Field>
      </div>
      <Field label="ICE / Identifiant fiscal">
        <Input defaultValue="001234567000045" />
      </Field>
      <Field label="N° de l'Ordre des Experts-Comptables">
        <Input defaultValue="OEC-2187" />
      </Field>
      <SaveButton onSave={onSave} saved={saved} />
    </Card>
  );
}

// ── Notifications section ──────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  { id: "overdue",   label: "Obligations en retard",        desc: "Alerte dès qu'une échéance est dépassée", default: true },
  { id: "week",      label: "Rappel 7 jours avant",         desc: "Email une semaine avant chaque échéance", default: true },
  { id: "day",       label: "Rappel la veille",             desc: "Notification le jour avant l'échéance",   default: false },
  { id: "message",   label: "Nouveau message client",       desc: "Notification à chaque message reçu",      default: true },
  { id: "done",      label: "Confirmation de traitement",   desc: "Résumé journalier des obligations réglées", default: false },
];

function NotificationsSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_ITEMS.map((n) => [n.id, n.default]))
  );

  return (
    <Card title="Notifications et rappels">
      <div className="space-y-3">
        {NOTIF_ITEMS.map((item) => (
          <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40">
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <div
              onClick={() => setPrefs((p) => ({ ...p, [item.id]: !p[item.id] }))}
              className={cn(
                "mt-0.5 flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                prefs[item.id] ? "bg-primary" : "bg-muted"
              )}
            >
              <div className={cn(
                "mx-0.5 size-4 rounded-full bg-white shadow transition-transform",
                prefs[item.id] ? "translate-x-4" : "translate-x-0"
              )} />
            </div>
          </label>
        ))}
      </div>
      <SaveButton onSave={onSave} saved={saved} />
    </Card>
  );
}

// ── Appearance section ─────────────────────────────────────────────────────────

const THEMES = [
  { id: "system", label: "Système", desc: "Suit le thème de votre OS" },
  { id: "light",  label: "Clair",   desc: "Interface en mode clair" },
  { id: "dark",   label: "Sombre",  desc: "Interface en mode sombre" },
];

function AppearanceSection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  const [theme, setTheme] = useState("system");
  const [density, setDensity] = useState("normal");

  return (
    <Card title="Apparence">
      <div>
        <p className="mb-2 text-sm font-medium">Thème</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors",
                theme === t.id ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/40"
              )}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">Densité d&apos;affichage</p>
        <div className="flex gap-2">
          {["compact", "normal", "spacieux"].map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm capitalize transition-colors",
                density === d ? "border-primary bg-primary/5 font-medium text-primary" : "text-muted-foreground hover:bg-muted/40"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <SaveButton onSave={onSave} saved={saved} />
    </Card>
  );
}

// ── Security section ───────────────────────────────────────────────────────────

function SecuritySection({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <Card title="Sécurité et accès">
      <Field label="Mot de passe actuel">
        <Input type="password" placeholder="••••••••" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nouveau mot de passe">
          <Input type="password" placeholder="••••••••" />
        </Field>
        <Field label="Confirmer">
          <Input type="password" placeholder="••••••••" />
        </Field>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Double authentification</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Protégez votre compte avec un code SMS à chaque connexion
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">Activer</Button>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Sessions actives</p>
        </div>
        {[
          { device: "MacBook Pro · Chrome", location: "Casablanca, MA", time: "Actuelle" },
          { device: "iPhone 15 · Safari",   location: "Casablanca, MA", time: "Il y a 2h" },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 text-xs text-muted-foreground border-t first:border-t-0">
            <div>
              <p className="font-medium text-foreground">{s.device}</p>
              <p>{s.location} · {s.time}</p>
            </div>
            {s.time !== "Actuelle" && (
              <button className="text-red-500 hover:underline">Révoquer</button>
            )}
          </div>
        ))}
      </div>
      <SaveButton onSave={onSave} saved={saved} />
    </Card>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function SaveButton({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end pt-1">
      <Button size="sm" onClick={onSave} className={cn(saved && "bg-emerald-600 hover:bg-emerald-600")}>
        <Save className="size-3.5" />
        {saved ? "Enregistré ✓" : "Enregistrer"}
      </Button>
    </div>
  );
}
