# ComptaFlow — Démo (Espace entreprise)

Plateforme collaborative de pré-comptabilité pour les entreprises marocaines et leurs
comptables. Cette démo couvre **l'espace entreprise** (côté client).

Stack : **Next.js 14 (App Router) · TypeScript · Tailwind CSS · composants shadcn/ui**.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000 → redirige vers `/login`.

Sur l'écran de connexion, choisissez **Entreprise** puis « Continuer »
(les identifiants de démo sont pré-remplis). Le rôle **Comptable** mène à une
page placeholder — ce portail sera développé plus tard.

## Périmètre de cette étape

- Connexion avec sélection du rôle (entreprise / comptable)
- Espace entreprise avec barre latérale :
  - **Tableau de bord** — KPI, dernières transactions, avancement du mois
  - **Transactions bancaires** — filtre *catégorisées / à catégoriser*, catégorisation en un clic
  - **Factures fournisseurs** — sources scan / email / import, statuts OCR
  - **Dépenses** — notes de frais, justificatifs manquants
  - **Factures clients** — ventes, encours, retards

Les données sont fictives (`src/lib/mock-data.ts`) — aucune API n'est encore branchée.

## Structure

```
src/
  app/
    login/                  écran de connexion (choix du rôle)
    accountant/             placeholder portail comptable
    (company)/              espace entreprise (layout + pages)
  components/               sidebar, topbar, composants ui (shadcn)
  lib/                      utils (format MAD/date) + données de démo
```
