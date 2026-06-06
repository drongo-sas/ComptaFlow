"use client";

import { useState } from "react";
import { Plus, Trash2, Landmark, TrendingUp, TrendingDown } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatMAD } from "@/lib/utils";
import { bankAccounts as seed, type BankAccount } from "@/lib/mock-data";

const BANK_COLORS: Record<string, string> = {
  Attijariwafa: "bg-orange-500/10 text-orange-600",
  "BMCE Bank of Africa": "bg-blue-500/10 text-blue-600",
  CIH: "bg-emerald-500/10 text-emerald-600",
  "Banque Populaire": "bg-amber-500/10 text-amber-600",
};

export default function AccountsSettingsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>(seed);
  const [adding, setAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({ label: "", bank: "", masked: "" });

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  function handleAdd() {
    if (!newAccount.label || !newAccount.bank) return;
    setAccounts((prev) => [
      ...prev,
      {
        id: `acc-${Date.now()}`,
        label: newAccount.label,
        bank: newAccount.bank,
        masked: newAccount.masked || "****0000",
        currency: "MAD",
        balance: 0,
      },
    ]);
    setNewAccount({ label: "", bank: "", masked: "" });
    setAdding(false);
  }

  function handleRemove(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <>
      <Topbar title="Comptes bancaires" subtitle="Comptes et relevés associés" />

      <div className="bg-paper flex-1 space-y-6 p-6">
        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Comptes actifs" value={`${accounts.length}`} />
          <SummaryCard label="Solde total" value={formatMAD(totalBalance)} tone="success" />
          <SummaryCard label="Devise" value="MAD — Dirham marocain" />
        </div>

        {/* Account list */}
        <div className="space-y-3">
          {accounts.map((acc, i) => {
            const colorClass =
              BANK_COLORS[acc.bank] ?? "bg-primary/10 text-primary";
            return (
              <Card key={acc.id} className="group">
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg font-semibold text-sm",
                      colorClass
                    )}
                  >
                    {i + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{acc.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {acc.bank} · {acc.masked}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="tnum font-mono font-semibold">
                      {formatMAD(acc.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">{acc.currency}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(acc.id)}
                    className="ml-2 hidden size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                    title="Supprimer ce compte"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add account form */}
        {adding ? (
          <Card className="border-dashed">
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-semibold">Nouveau compte bancaire</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Libellé
                  </label>
                  <input
                    value={newAccount.label}
                    onChange={(e) =>
                      setNewAccount((n) => ({ ...n, label: e.target.value }))
                    }
                    placeholder="Ex. Compte courant"
                    className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Banque
                  </label>
                  <input
                    value={newAccount.bank}
                    onChange={(e) =>
                      setNewAccount((n) => ({ ...n, bank: e.target.value }))
                    }
                    placeholder="Ex. CIH Bank"
                    className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    N° masqué
                  </label>
                  <input
                    value={newAccount.masked}
                    onChange={(e) =>
                      setNewAccount((n) => ({ ...n, masked: e.target.value }))
                    }
                    placeholder="****1234"
                    className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd}>
                  <Landmark className="size-4" />
                  Ajouter le compte
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAdding(false)}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Plus className="size-4" />
            Ajouter un compte ou une carte
          </button>
        )}

        {/* Note */}
        <p className="text-xs text-muted-foreground">
          Les relevés de ces comptes sont importés depuis l'onglet{" "}
          <strong>Relevés bancaires</strong> des transactions.
        </p>
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={cn(
            "tnum mt-1 font-mono text-lg font-semibold",
            tone === "success" && "text-success"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
