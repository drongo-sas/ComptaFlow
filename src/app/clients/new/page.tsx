"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Upload, FileText, X,
  Building2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Document types required for a new dossier ─────────────────────────────────

const DOC_TYPES = [
  { id: "statuts",  label: "Statuts de la société",         hint: "Acte constitutif signé"           },
  { id: "rc",       label: "Registre de commerce",          hint: "Extrait récent (moins de 3 mois)" },
  { id: "if",       label: "Identifiant fiscal (IF)",        hint: "Attestation DGI"                  },
  { id: "ice",      label: "Certificat ICE",                 hint: "Identifiant commun de l'entreprise" },
  { id: "cin",      label: "CIN du gérant",                  hint: "Copie recto-verso"                },
  { id: "rib",      label: "RIB bancaire",                   hint: "Relevé d'identité bancaire"       },
];

const LEGAL_FORMS = ["SARL", "SA", "SAS", "SNC", "GIE", "Auto-entrepreneur", "Autre"];

type UploadedFile = { docId: string; file: File };

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewDossierPage() {
  const router = useRouter();

  // Company info
  const [name,       setName]      = useState("");
  const [legalForm,  setLegalForm] = useState("SARL");
  const [city,       setCity]      = useState("");
  const [activity,   setActivity]  = useState("");
  const [ice,        setIce]       = useState("");
  const [identifiantFiscal, setIF] = useState("");
  const [rc,         setRc]        = useState("");
  const [email,      setEmail]     = useState("");
  const [phone,      setPhone]     = useState("");

  // Documents
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleFile(docId: string, file: File | undefined) {
    if (!file) return;
    setUploads((prev) => {
      const filtered = prev.filter((u) => u.docId !== docId);
      return [...filtered, { docId, file }];
    });
  }

  function removeFile(docId: string) {
    setUploads((prev) => prev.filter((u) => u.docId !== docId));
  }

  function getUpload(docId: string) {
    return uploads.find((u) => u.docId === docId);
  }

  const canSubmit = name.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    // In a real app: POST to API, get new client id
    // For demo: navigate back to clients list
    router.push("/clients");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">

      {/* ── Back ── */}
      <button
        onClick={() => router.push("/clients")}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Mes dossiers
      </button>

      {/* ── Title ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau dossier</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Renseignez les informations de la société et déposez les documents constitutifs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Section 1: Company info ── */}
        <section>
          <SectionTitle icon={<Building2 className="size-4" />} title="Informations de la société" />

          <div className="mt-4 space-y-4 rounded-xl border bg-card p-6 shadow-sm">

            {/* Name + Legal form */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium">
                  Raison sociale <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Argan Digital"
                  autoFocus
                  className={field()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Forme juridique</label>
                <select
                  value={legalForm}
                  onChange={(e) => setLegalForm(e.target.value)}
                  className={field()}
                >
                  {LEGAL_FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            {/* City + Activity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Ville</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Casablanca"
                  className={field()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Secteur d&apos;activité</label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Commerce, Services, Industrie…"
                  className={field()}
                />
              </div>
            </div>

            {/* ICE + IF + RC */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">ICE</label>
                <input
                  type="text"
                  value={ice}
                  onChange={(e) => setIce(e.target.value)}
                  placeholder="15 chiffres"
                  maxLength={15}
                  className={cn(field(), "font-mono")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Identifiant fiscal</label>
                <input
                  type="text"
                  value={identifiantFiscal}
                  onChange={(e) => setIF(e.target.value)}
                  placeholder="IF"
                  className={cn(field(), "font-mono")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Registre de commerce</label>
                <input
                  type="text"
                  value={rc}
                  onChange={(e) => setRc(e.target.value)}
                  placeholder="RC"
                  className={cn(field(), "font-mono")}
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Email du responsable
                  <span className="ml-1 font-normal text-muted-foreground text-xs">(invitation client)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@entreprise.ma"
                  className={field()}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6XX XXX XXX"
                  className={field()}
                />
              </div>
            </div>

          </div>
        </section>

        {/* ── Section 2: Documents ── */}
        <section>
          <SectionTitle icon={<FileText className="size-4" />} title="Documents constitutifs" />
          <p className="mt-1 mb-4 text-xs text-muted-foreground">
            Ces documents sont conservés dans le dossier du client. Vous pouvez les ajouter maintenant ou plus tard.
          </p>

          <div className="space-y-2">
            {DOC_TYPES.map((doc) => {
              const uploaded = getUpload(doc.id);
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 rounded-xl border bg-card px-5 py-3.5 shadow-sm"
                >
                  {/* Status icon */}
                  {uploaded ? (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                  ) : (
                    <div className="size-5 shrink-0 rounded-full border-2 border-muted-foreground/20" />
                  )}

                  {/* Label */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{doc.label}</p>
                    {uploaded ? (
                      <p className="truncate text-xs text-emerald-600">{uploaded.file.name}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{doc.hint}</p>
                    )}
                  </div>

                  {/* Action */}
                  {uploaded ? (
                    <button
                      type="button"
                      onClick={() => removeFile(doc.id)}
                      className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  ) : (
                    <>
                      <input
                        ref={(el) => { fileRefs.current[doc.id] = el; }}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFile(doc.id, e.target.files?.[0])}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-xs"
                        onClick={() => fileRefs.current[doc.id]?.click()}
                      >
                        <Upload className="size-3.5" />
                        Ajouter
                      </Button>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upload count */}
          {uploads.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {uploads.length} document{uploads.length !== 1 ? "s" : ""} ajouté{uploads.length !== 1 ? "s" : ""}
            </p>
          )}
        </section>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.push("/clients")}>
            Annuler
          </Button>
          <Button type="submit" disabled={!canSubmit} size="lg">
            Créer le dossier
          </Button>
        </div>

      </form>
    </main>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function field() {
  return "w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}
