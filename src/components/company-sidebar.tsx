"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  FileInput,
  ReceiptText,
  FileOutput,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { company } from "@/lib/mock-data";

const nav = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/bank-transactions", label: "Transactions bancaires", icon: Landmark },
  { href: "/supplier-invoices", label: "Factures fournisseurs", icon: FileInput },
  { href: "/expenses", label: "Dépenses", icon: ReceiptText },
  { href: "/customer-invoices", label: "Factures clients", icon: FileOutput },
];

export function CompanySidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="font-mono text-sm font-semibold">C</span>
        </div>
        <span className="text-base font-semibold tracking-tight text-white">Comptia</span>
      </div>

      {/* Company switcher */}
      <div className="mx-3 mb-2 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary/20 text-xs font-semibold text-white">
          {company.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{company.name}</p>
          <p className="truncate font-mono text-[11px] text-sidebar-foreground/60">
            ICE {company.ice}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-white"
                  : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-0.5">
        <Link
          href="/settings/company"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            pathname.startsWith("/settings")
              ? "bg-sidebar-accent font-medium text-white"
              : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={pathname.startsWith("/settings") ? 2.2 : 1.8} />
          Paramètres
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}
