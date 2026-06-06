"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { type CustomerInvoice, customerInvoices } from "@/lib/mock-data";
import { useSidebar } from "@/lib/sidebar-context";
import { InvoiceEditor } from "../invoice-editor";

export default function NewInvoicePage() {
  const router = useRouter();
  const { setCollapsed } = useSidebar();

  const [invoice] = useState<CustomerInvoice>(() => ({
    id: `c-${Date.now()}`,
    customer: "",
    customerAddress: "",
    customerCity: "",
    customerICE: "",
    customerIF: "",
    number: `VTE-${new Date().getFullYear()}-${String(customerInvoices.length + 44).padStart(3, "0")}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    amountHT: 0,
    vat: 0,
    total: 0,
    status: "draft",
    items: [],
  }));

  useEffect(() => {
    setCollapsed(true);
    return () => setCollapsed(false);
  }, [setCollapsed]);

  function handleSave(_id: string, _patch: Partial<CustomerInvoice>) {
    // In a real app: POST to API, then navigate to the saved invoice
    router.push("/customer-invoices");
  }

  return (
    <>
      <Topbar title="Nouvelle facture" subtitle={invoice.number} />
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
