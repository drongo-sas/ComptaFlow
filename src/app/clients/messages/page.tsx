"use client";

import { useState } from "react";
import { Send, Paperclip, Search } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ── Mock data ──────────────────────────────────────────────────────────────────

const THREADS = [
  {
    id: "t1", clientId: "cl2", clientName: "Atlas Distribution SARL", initials: "AT",
    subject: "Relevés BCP manquants — Mars & Avril",
    lastMessage: "Bonjour, pouvez-vous nous envoyer les relevés BCP pour mars et avril ? Nous en avons besoin pour finaliser la déclaration TVA.",
    time: "10:14", date: "Aujourd'hui", unread: 2, color: "bg-rose-500",
  },
  {
    id: "t2", clientId: "cl5", clientName: "Café Riad SARL", initials: "CR",
    subject: "Invitation — Accès comptable",
    lastMessage: "Votre invitation pour accéder au dossier Café Riad a été envoyée. En attente de confirmation du client.",
    time: "09:02", date: "Aujourd'hui", unread: 1, color: "bg-orange-500",
  },
  {
    id: "t3", clientId: "cl1", clientName: "Argan Digital SARL", initials: "AD",
    subject: "IS Acompte Q2 — Confirmation",
    lastMessage: "Parfait, nous avons bien reçu le justificatif. L'IS acompte Q2 sera traité avant le 30 juin.",
    time: "Hier", date: "Hier", unread: 0, color: "bg-sky-500",
  },
  {
    id: "t4", clientId: "cl4", clientName: "Groupe Saham", initials: "GS",
    subject: "Factures fournisseurs avril",
    lastMessage: "Merci pour les documents. Les 3 factures fournisseurs ont été validées et enregistrées.",
    time: "04 juin", date: "04 juin", unread: 0, color: "bg-violet-500",
  },
];

const MESSAGES: Record<string, { id: string; from: "accountant" | "client"; text: string; time: string }[]> = {
  t1: [
    { id: "m1", from: "accountant", text: "Bonjour, nous avons besoin des relevés BCP pour mars et avril afin de finaliser vos déclarations TVA en retard.", time: "08:30" },
    { id: "m2", from: "client",     text: "Bonjour, je vais les récupérer auprès de notre agence ce matin.", time: "09:45" },
    { id: "m3", from: "client",     text: "J'ai le relevé de mars, je cherche encore celui d'avril.", time: "10:14" },
  ],
  t2: [
    { id: "m1", from: "accountant", text: "Bonjour, je vous envoie une invitation pour accéder à votre dossier comptable sur ComptaFlow. Merci de l'accepter dès que possible.", time: "09:02" },
  ],
  t3: [
    { id: "m1", from: "client",     text: "Bonjour, voici le justificatif du paiement IS Q1 2026.", time: "Hier 14:30" },
    { id: "m2", from: "accountant", text: "Parfait, nous avons bien reçu le justificatif. L'IS acompte Q2 sera traité avant le 30 juin.", time: "Hier 15:00" },
  ],
  t4: [
    { id: "m1", from: "client",     text: "Bonjour, voici les 3 factures fournisseurs d'avril.", time: "04 juin" },
    { id: "m2", from: "accountant", text: "Merci pour les documents. Les 3 factures ont été validées et enregistrées.", time: "04 juin" },
  ],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [activeThread, setActiveThread] = useState(THREADS[0]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const filtered = THREADS.filter((t) =>
    t.clientName.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const messages = MESSAGES[activeThread.id] ?? [];

  function sendMessage() {
    if (!input.trim()) return;
    setInput("");
    // mock: no actual state update needed for demo
  }

  return (
    <>
      <Topbar title="Messages" subtitle="Communications avec vos clients" initials="AB" />
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">

        {/* ── Thread list ── */}
        <div className="flex w-72 shrink-0 flex-col border-r bg-card">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread)}
                className={cn(
                  "flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition-colors",
                  activeThread.id === thread.id ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", thread.color)}>
                  {thread.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn("truncate text-sm", thread.unread > 0 ? "font-semibold" : "font-medium")}>
                      {thread.clientName.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{thread.time}</span>
                  </div>
                  <p className="truncate text-xs font-medium text-foreground/70">{thread.subject}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && (
                  <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {thread.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Conversation ── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 border-b px-6 py-3.5">
            <div className={cn("flex size-8 items-center justify-center rounded-full text-xs font-bold text-white", activeThread.color)}>
              {activeThread.initials}
            </div>
            <div>
              <p className="font-semibold text-sm">{activeThread.clientName}</p>
              <p className="text-xs text-muted-foreground">{activeThread.subject}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.from === "accountant" ? "flex-row-reverse" : "")}>
                <div className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  msg.from === "accountant"
                    ? "bg-primary text-primary-foreground"
                    : cn("text-white", activeThread.color)
                )}>
                  {msg.from === "accountant" ? "AB" : activeThread.initials}
                </div>
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.from === "accountant"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-muted"
                )}>
                  <p>{msg.text}</p>
                  <p className={cn(
                    "mt-1 text-[10px]",
                    msg.from === "accountant" ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
                  )}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Écrire un message…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="text-muted-foreground hover:text-foreground">
                <Paperclip className="size-4" />
              </button>
              <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={sendMessage} disabled={!input.trim()}>
                <Send className="size-3" />
                Envoyer
              </Button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
