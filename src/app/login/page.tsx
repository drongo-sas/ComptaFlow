"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Role = "company" | "accountant";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("company");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(role === "company" ? "/dashboard" : "/accountant");
  }

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* Left — brand panel */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-success/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-mono text-sm font-semibold">C</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Comptia</span>
        </div>

        <div className="relative max-w-md space-y-6">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            La comptabilité, sans les allers-retours WhatsApp.
          </h1>
          <p className="text-sidebar-foreground/80">
            Centralisez vos factures, reçus et relevés bancaires. Votre comptable
            travaille sur les mêmes données, en temps réel.
          </p>
          <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
            <ShieldCheck className="size-4" />
            Données chiffrées · conforme aux pratiques marocaines
          </div>
        </div>

        <div className="relative text-sm text-sidebar-foreground/50">
          © 2026 Comptia · Démo
        </div>
      </section>

      {/* Right — form */}
      <section className="bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-mono text-sm font-semibold">C</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">Comptia</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Connexion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sélectionnez votre type de compte pour continuer.
          </p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <RoleCard
              active={role === "company"}
              onClick={() => setRole("company")}
              icon={<Building2 className="size-5" />}
              title="Entreprise"
              subtitle="Je dépose mes pièces"
            />
            <RoleCard
              active={role === "accountant"}
              onClick={() => setRole("accountant")}
              icon={<Briefcase className="size-5" />}
              title="Comptable"
              subtitle="Je gère des clients"
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" placeholder="vous@entreprise.ma" defaultValue="demo@argan.ma" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">
                  Mot de passe
                </label>
                <Link href="#" className="text-xs text-primary hover:underline">
                  Oublié ?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" defaultValue="demo1234" />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Continuer en tant que {role === "company" ? "entreprise" : "comptable"}
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Créer un espace
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-lg border-2 bg-card p-4 text-left transition-all",
        active
          ? "border-primary ring-2 ring-primary/15"
          : "border-border hover:border-primary/40"
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-md",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold leading-none">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </button>
  );
}
