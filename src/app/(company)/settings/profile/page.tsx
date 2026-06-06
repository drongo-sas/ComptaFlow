"use client";

import { useState } from "react";
import { Pencil, Save, X, Shield, Globe } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { userProfile } from "@/lib/mock-data";

export default function ProfileSettingsPage() {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    language: userProfile.language,
  });

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  return (
    <>
      <Topbar title="Profil utilisateur" subtitle="Vos informations personnelles" />

      <div className="bg-paper flex-1 space-y-6 p-6">
        {/* Avatar + name */}
        <Card>
          <CardContent className="flex items-center gap-5 p-6">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">
                {userProfile.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-lg font-bold">{fields.name}</p>
              <p className="text-sm text-muted-foreground">{fields.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="default">{userProfile.role}</Badge>
                <Badge variant="secondary">Argan Digital SARL</Badge>
              </div>
            </div>
            <div className="flex gap-2">
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <Field
                label="Nom complet"
                value={fields.name}
                editing={editing}
                onChange={(v) => set("name", v)}
              />
              <Field
                label="Adresse e-mail"
                value={fields.email}
                type="email"
                editing={editing}
                onChange={(v) => set("email", v)}
              />
              <Field
                label="Téléphone"
                value={fields.phone}
                type="tel"
                editing={editing}
                onChange={(v) => set("phone", v)}
              />
              <Field label="Rôle" value={userProfile.role} />
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Préférences</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <Field
                label="Langue"
                value={fields.language}
                editing={editing}
                onChange={(v) => set("language", v)}
                icon={<Globe className="size-4 text-muted-foreground" />}
              />
              <div className="flex items-center gap-3 py-3">
                <span className="w-40 shrink-0 text-sm text-muted-foreground">
                  Authentification 2FA
                </span>
                <div className="flex items-center gap-2">
                  <Shield className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Non activée</span>
                  <button className="ml-2 text-xs font-medium text-primary hover:underline">
                    Activer
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <span className="w-40 shrink-0 text-sm text-muted-foreground">
                  Notifications email
                </span>
                <Toggle />
              </div>
              <div className="flex items-center gap-3 py-3">
                <span className="w-40 shrink-0 text-sm text-muted-foreground">
                  Rappels comptables
                </span>
                <Toggle defaultOn />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danger zone */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-destructive">Zone sensible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Changer le mot de passe</p>
                <p className="text-xs text-muted-foreground">
                  Un lien de réinitialisation sera envoyé à votre adresse email.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Envoyer le lien
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  type = "text",
  editing,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  type?: string;
  editing?: boolean;
  onChange?: (v: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
      {editing && onChange ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-input bg-muted/40 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      ) : (
        <span className="flex flex-1 items-center gap-2 text-sm font-medium">
          {icon}
          {value}
        </span>
      )}
    </div>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-input"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
