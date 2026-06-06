"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { customerInvoices, type CustomerInvoice } from "@/lib/mock-data";
import { useSidebar } from "@/lib/sidebar-context";
import { InvoiceEditor } from "../../invoice-editor";

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { setCollapsed } = useSidebar();

  const invoice = customerInvoices.find((inv) => inv.id === id);

  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

  if (!invoice) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Facture introuvable.
      </div>
    );
  }

  function handleSave(_id: string, _patch: Partial<CustomerInvoice>) {
    router.push("/customer-invoices");
  }

  return (
    <>
      <Topbar title="Modifier la facture" subtitle={invoice.number} />
      <div className="flex flex-1 overflow-hidden">
        <InvoiceEditor
          key={invoice.id}
          invoice={invoice}
          onSave={handleSave}
          onClose={() => router.push("/customer-invoices")}
        />
      </div>
    </>
  );
}
