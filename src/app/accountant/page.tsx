import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountantPage() {
  return (
    <main className="bg-paper flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Briefcase className="size-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Espace comptable</h1>
        <p className="mt-2 text-muted-foreground">
          Le portail comptable (portefeuille clients, file de revue, rapprochement,
          relances) sera développé dans une prochaine étape. Cette démo se concentre
          pour l’instant sur l’espace entreprise.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/login">
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
        </Button>
      </div>
    </main>
  );
}
