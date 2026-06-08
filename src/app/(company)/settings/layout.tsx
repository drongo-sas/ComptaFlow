"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Landmark, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_NAV = [
  { href: "/settings/company", label: "Ma société", icon: Building2 },
  { href: "/settings/accounts", label: "Comptes bancaires", icon: Landmark },
  { href: "/settings/profile", label: "Profil utilisateur", icon: User },
  { href: "/settings/accountant", label: "Accès comptable", icon: Briefcase },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-w-0 flex-1">
      {/* Settings sub-nav */}
      <aside className="sticky top-0 h-screen w-52 shrink-0 border-r bg-card/60">
        <div className="px-5 py-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Paramètres
          </h2>
        </div>
        <nav className="space-y-0.5 px-3">
          {SETTINGS_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page content */}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
