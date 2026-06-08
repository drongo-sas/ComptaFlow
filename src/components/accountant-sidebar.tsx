"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FolderOpen, CalendarDays, MessageSquare,
  Users, CalendarCheck, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { dossierObligations } from "@/lib/mock-data";

const TODAY = new Date("2026-06-08");
function isOverdue(d: string) { return new Date(d) < TODAY; }

const MAIN_NAV = [
  { label: "Dossiers",   href: "/clients/dossiers", icon: FolderOpen   },
  { label: "Suivi",      href: "/clients/calendar", icon: CalendarDays },
  { label: "Messages",   href: "/clients/messages", icon: MessageSquare },
];

const BOTTOM_NAV = [
  { label: "Équipe",     href: "/clients/team",      icon: Users        },
  { label: "Modèles",    href: "/clients/templates", icon: CalendarCheck },
  { label: "Paramètres", href: "/clients/settings",  icon: Settings      },
];

export function AccountantSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { setRole, setActiveClientId } = useRole();

  const overdueCount   = dossierObligations.filter(
    (o) => o.status !== "done" && o.status !== "na" && isOverdue(o.dueDate)
  ).length;
  const unreadMessages = 3;

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  function handleLogout() {
    setRole("company");
    setActiveClientId(null);
    router.push("/login");
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">

      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="font-mono text-sm font-semibold">C</span>
        </div>
        <span className="text-base font-semibold tracking-tight text-white">ComptaFlow</span>
      </div>

      {/* Accountant identity chip */}
      <div className="mx-3 mb-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/20 text-xs font-semibold text-white">
          AB
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">A. Benjelloun</p>
          <p className="truncate font-mono text-[11px] text-sidebar-foreground/60">Expert-comptable</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {MAIN_NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const badge =
            href === "/clients/messages" ? unreadMessages :
            href === "/clients/dossiers" ? overdueCount  : 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-white"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              <span className="flex-1">{label}</span>
              {badge > 0 && (
                <span className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                  href === "/clients/messages" ? "bg-blue-500 text-white" : "bg-red-500 text-white"
                )}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-2 border-t border-sidebar-border/50" />

        {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-white"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-sidebar-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
