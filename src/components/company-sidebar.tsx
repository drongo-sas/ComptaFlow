"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Landmark, FileInput, ReceiptText,
  FileOutput, Settings, LogOut, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { company, accountingClients } from "@/lib/mock-data";
import { useSidebar } from "@/lib/sidebar-context";
import { useRole } from "@/lib/role-context";

const nav = [
  { href: "/dashboard",          label: "Tableau de bord",       icon: LayoutDashboard },
  { href: "/bank-transactions",  label: "Transactions bancaires", icon: Landmark       },
  { href: "/supplier-invoices",  label: "Factures fournisseurs",  icon: FileInput      },
  { href: "/expenses",           label: "Dépenses",               icon: ReceiptText    },
  { href: "/customer-invoices",  label: "Factures clients",       icon: FileOutput     },
];

export function CompanySidebar() {
  const pathname  = usePathname();
  const { collapsed } = useSidebar();
  const { role, activeClientId } = useRole();

  const isAccountant  = role === "accountant";
  const activeClient  = isAccountant
    ? accountingClients.find((c) => c.id === activeClientId) ?? accountingClients[0]
    : null;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* ── Accountant back-link ── */}
      {isAccountant && (
        <Link
          href={activeClient ? `/clients/${activeClient.id}` : "/clients"}
          title={collapsed ? "Mes dossiers" : undefined}
          className={cn(
            "flex items-center gap-2 border-b border-sidebar-border py-3 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:text-white",
            collapsed ? "justify-center px-0" : "px-4",
          )}
        >
          <ChevronLeft className="size-4 shrink-0" />
          {!collapsed && "Mes dossiers"}
        </Link>
      )}

      {/* Brand */}
      <div className={cn("flex h-16 items-center", collapsed ? "justify-center px-0" : "gap-2.5 px-5")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="font-mono text-sm font-semibold">C</span>
        </div>
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight text-white">Comptia</span>
        )}
      </div>

      {/* Company switcher */}
      <div
        className={cn(
          "mx-3 mb-2 flex items-center rounded-lg bg-white/5",
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
        )}
        title={collapsed ? (activeClient?.name ?? company.name) : undefined}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/20 text-xs font-semibold text-white">
          {activeClient?.initials ?? company.initials}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {activeClient?.name ?? company.name}
            </p>
            <p className="truncate font-mono text-[11px] text-sidebar-foreground/60">
              ICE {activeClient?.ice ?? company.ice}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon   = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm transition-colors",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                active
                  ? "bg-sidebar-accent font-medium text-white"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-sidebar-border p-3">
        <Link
          href="/settings/company"
          title={collapsed ? "Paramètres" : undefined}
          className={cn(
            "flex items-center rounded-lg py-2.5 text-sm transition-colors",
            collapsed ? "justify-center px-0" : "gap-3 px-3",
            pathname.startsWith("/settings")
              ? "bg-sidebar-accent font-medium text-white"
              : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" strokeWidth={pathname.startsWith("/settings") ? 2.2 : 1.8} />
          {!collapsed && "Paramètres"}
        </Link>
        <Link
          href="/login"
          title={collapsed ? "Déconnexion" : undefined}
          className={cn(
            "flex items-center rounded-lg py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white",
            collapsed ? "justify-center px-0" : "gap-3 px-3",
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          {!collapsed && "Déconnexion"}
        </Link>
      </div>
    </aside>
  );
}
