// Demo data for the company portal. In a real app this comes from the API.

export type TxCategory =
  | "customer_payment"
  | "supplier_payment"
  | "software"
  | "rent"
  | "telecom"
  | "transport"
  | "meals"
  | "marketing"
  | "supplies"
  | "utilities"
  | "salary"
  | "cnss"
  | "tax_is"
  | "tax_tva"
  | "tax_other"
  | "bank_fee"
  | "transfer"
  | "withdrawal"
  | "other";

export const CATEGORY_LABELS: Record<TxCategory, string> = {
  customer_payment: "Encaissement client",
  supplier_payment: "Paiement fournisseur",
  software: "Abonnement logiciel",
  rent: "Loyers et charges",
  telecom: "Télécommunications",
  transport: "Transport et déplacements",
  meals: "Restaurant et repas",
  marketing: "Publicité et marketing",
  supplies: "Fournitures et matériel",
  utilities: "Eau, gaz, électricité",
  salary: "Salaires",
  cnss: "Cotisations CNSS",
  tax_is: "Impôt sur les sociétés (IS)",
  tax_tva: "TVA décaissée",
  tax_other: "Autres impôts et taxes",
  bank_fee: "Frais bancaires",
  transfer: "Virement interne",
  withdrawal: "Retrait espèces",
  other: "Autre",
};

export const CATEGORY_GROUPS: { label: string; items: TxCategory[] }[] = [
  {
    label: "Revenus",
    items: ["customer_payment"],
  },
  {
    label: "Charges externes",
    items: [
      "supplier_payment",
      "software",
      "rent",
      "telecom",
      "utilities",
      "transport",
      "meals",
      "marketing",
      "supplies",
    ],
  },
  {
    label: "Charges de personnel",
    items: ["salary", "cnss"],
  },
  {
    label: "Impôts et taxes",
    items: ["tax_is", "tax_tva", "tax_other"],
  },
  {
    label: "Opérations bancaires",
    items: ["bank_fee", "transfer", "withdrawal"],
  },
  {
    label: "Divers",
    items: ["other"],
  },
];

export type VatRate = "20" | "14" | "10" | "7" | "0" | "exempt";

export const VAT_RATE_GROUPS: { label: string; rates: { value: VatRate; label: string }[] }[] = [
  {
    label: "Taux courants",
    rates: [
      { value: "20", label: "20,00 %" },
      { value: "14", label: "14,00 %" },
      { value: "10", label: "10,00 %" },
      { value: "7", label: "7,00 %" },
      { value: "0", label: "0,00 % — Exonéré" },
    ],
  },
  {
    label: "Hors champ",
    rates: [{ value: "exempt", label: "Hors champ TVA" }],
  },
];

export const ALL_VAT_RATES = VAT_RATE_GROUPS.flatMap((g) => g.rates);

export function getVatLabel(vat: VatRate | null | undefined): string {
  if (!vat) return "À définir";
  return ALL_VAT_RATES.find((r) => r.value === vat)?.label ?? "—";
}

export interface BankTransaction {
  id: string;
  date: string;
  label: string;
  reference: string;
  amount: number; // negative = debit, positive = credit
  account: string;
  category: TxCategory | null;
  matched: boolean;
  vat: VatRate | null;
  verified: boolean;
  note: string;
}

export const bankTransactions: BankTransaction[] = [
  {
    id: "t1",
    date: "2026-05-28",
    label: "VIR SARL ATLAS DISTRIB",
    reference: "VIR-90455",
    amount: 18450,
    account: "Attijariwafa ****4021",
    category: "customer_payment",
    matched: true,
    vat: "20",
    verified: true,
    note: "",
  },
  {
    id: "t2",
    date: "2026-05-27",
    label: "PRLV CNSS COTISATION",
    reference: "CNSS-0525",
    amount: -6320.5,
    account: "Attijariwafa ****4021",
    category: "cnss",
    matched: true,
    vat: "exempt",
    verified: true,
    note: "",
  },
  {
    id: "t3",
    date: "2026-05-26",
    label: "CB GLOVO MAROC",
    reference: "CB-77120",
    amount: -284,
    account: "BMCE ****8830",
    category: null,
    matched: false,
    vat: null,
    verified: false,
    note: "",
  },
  {
    id: "t4",
    date: "2026-05-25",
    label: "VIR MARJANE HOLDING",
    reference: "VIR-88231",
    amount: -9600,
    account: "Attijariwafa ****4021",
    category: "supplier_payment",
    matched: true,
    vat: "20",
    verified: true,
    note: "",
  },
  {
    id: "t5",
    date: "2026-05-24",
    label: "RETRAIT GAB AGDAL",
    reference: "GAB-1190",
    amount: -2000,
    account: "BMCE ****8830",
    category: null,
    matched: false,
    vat: null,
    verified: false,
    note: "",
  },
  {
    id: "t6",
    date: "2026-05-22",
    label: "FRAIS TENUE DE COMPTE",
    reference: "FRAIS-05",
    amount: -45,
    account: "Attijariwafa ****4021",
    category: "bank_fee",
    matched: true,
    vat: "0",
    verified: true,
    note: "",
  },
  {
    id: "t7",
    date: "2026-05-21",
    label: "VIR SALAIRE Y. BENNANI",
    reference: "SAL-0525",
    amount: -8200,
    account: "Attijariwafa ****4021",
    category: "salary",
    matched: true,
    vat: "exempt",
    verified: true,
    note: "",
  },
  {
    id: "t8",
    date: "2026-05-20",
    label: "CB SHELL STATION",
    reference: "CB-66012",
    amount: -540,
    account: "BMCE ****8830",
    category: null,
    matched: false,
    vat: null,
    verified: false,
    note: "",
  },
  {
    id: "t9",
    date: "2026-05-19",
    label: "VIR RECU TECHNO PLUS",
    reference: "VIR-71001",
    amount: 12300,
    account: "Attijariwafa ****4021",
    category: "customer_payment",
    matched: true,
    vat: "20",
    verified: true,
    note: "",
  },
  {
    id: "t10",
    date: "2026-05-18",
    label: "PAIEMENT IGR ACOMPTE",
    reference: "DGI-2206",
    amount: -4150,
    account: "Attijariwafa ****4021",
    category: null,
    matched: false,
    vat: null,
    verified: false,
    note: "",
  },
  {
    id: "t11",
    date: "2026-05-16",
    label: "CB AMAZON WEB SERVICES",
    reference: "CB-55430",
    amount: -1290,
    account: "BMCE ****8830",
    category: "software",
    matched: false,
    vat: "20",
    verified: false,
    note: "",
  },
  {
    id: "t12",
    date: "2026-05-15",
    label: "VIR INTERNE EPARGNE",
    reference: "VIR-INT-04",
    amount: -5000,
    account: "Attijariwafa ****4021",
    category: "transfer",
    matched: true,
    vat: "exempt",
    verified: true,
    note: "",
  },
];

export interface SupplierInvoice {
  id: string;
  supplier: string;
  number: string;
  date: string;
  dueDate: string;
  amountHT: number;
  vat: number;
  total: number;
  vatRate?: string;
  source: "scan" | "email" | "upload";
  status: "draft" | "validated" | "paid" | "overdue";
  fileUrl?: string;
  fileType?: "pdf" | "image";
}

export const supplierInvoices: SupplierInvoice[] = [
  {
    id: "s1",
    supplier: "Marjane Holding",
    number: "FA-2026-1182",
    date: "2026-05-25",
    dueDate: "2026-06-24",
    amountHT: 8000,
    vat: 1600,
    total: 9600,
    source: "email",
    status: "paid",
  },
  {
    id: "s2",
    supplier: "Amazon Web Services",
    number: "AWS-INV-99213",
    date: "2026-05-16",
    dueDate: "2026-05-16",
    amountHT: 1075,
    vat: 215,
    total: 1290,
    source: "email",
    status: "draft",
  },
  {
    id: "s3",
    supplier: "Papeterie Centrale",
    number: "PC-0455",
    date: "2026-05-14",
    dueDate: "2026-06-13",
    amountHT: 920,
    vat: 184,
    total: 1104,
    source: "scan",
    status: "draft",
  },
  {
    id: "s4",
    supplier: "ONEE Électricité",
    number: "ONEE-552310",
    date: "2026-05-10",
    dueDate: "2026-05-30",
    amountHT: 1450,
    vat: 290,
    total: 1740,
    source: "upload",
    status: "overdue",
  },
  {
    id: "s5",
    supplier: "Maroc Telecom",
    number: "IAM-77120",
    date: "2026-05-05",
    dueDate: "2026-06-04",
    amountHT: 600,
    vat: 120,
    total: 720,
    source: "scan",
    status: "validated",
  },
  {
    id: "s6",
    supplier: "BEL S.A",
    number: "F-2026-03",
    date: "2026-03-30",
    dueDate: "2026-04-30",
    amountHT: 13600,
    vat: 2720,
    total: 16320,
    vatRate: "20",
    source: "upload",
    status: "draft",
    // Replace with actual Cloudflare R2 URL once storage is configured
    // fileUrl: "https://your-bucket.r2.dev/invoices/F-2026-03.pdf",
    // fileType: "pdf",
  },
];

export interface Expense {
  id: string;
  title: string;
  employee: string;
  date: string;
  category: string;
  amount: number;
  hasReceipt: boolean;
  status: "to_review" | "approved" | "rejected";
}

export const expenses: Expense[] = [
  {
    id: "e1",
    title: "Déjeuner client",
    employee: "Y. Bennani",
    date: "2026-05-26",
    category: "Restauration",
    amount: 340,
    hasReceipt: true,
    status: "to_review",
  },
  {
    id: "e2",
    title: "Carburant",
    employee: "S. El Amrani",
    date: "2026-05-24",
    category: "Déplacement",
    amount: 540,
    hasReceipt: true,
    status: "approved",
  },
  {
    id: "e3",
    title: "Livraison Glovo",
    employee: "Y. Bennani",
    date: "2026-05-26",
    category: "Divers",
    amount: 284,
    hasReceipt: false,
    status: "to_review",
  },
  {
    id: "e4",
    title: "Fournitures bureau",
    employee: "K. Tazi",
    date: "2026-05-20",
    category: "Bureau",
    amount: 210,
    hasReceipt: true,
    status: "approved",
  },
  {
    id: "e5",
    title: "Parking aéroport",
    employee: "S. El Amrani",
    date: "2026-05-18",
    category: "Déplacement",
    amount: 120,
    hasReceipt: false,
    status: "rejected",
  },
];

export interface CustomerInvoice {
  id: string;
  customer: string;
  number: string;
  date: string;
  dueDate: string;
  amountHT: number;
  vat: number;
  total: number;
  status: "draft" | "sent" | "partial" | "paid" | "overdue";
}

export const customerInvoices: CustomerInvoice[] = [
  {
    id: "c1",
    customer: "Atlas Distribution SARL",
    number: "VTE-2026-041",
    date: "2026-05-20",
    dueDate: "2026-06-19",
    amountHT: 15375,
    vat: 3075,
    total: 18450,
    status: "paid",
  },
  {
    id: "c2",
    customer: "Techno Plus",
    number: "VTE-2026-040",
    date: "2026-05-12",
    dueDate: "2026-06-11",
    amountHT: 10250,
    vat: 2050,
    total: 12300,
    status: "paid",
  },
  {
    id: "c3",
    customer: "Groupe Saham",
    number: "VTE-2026-042",
    date: "2026-05-28",
    dueDate: "2026-06-27",
    amountHT: 22000,
    vat: 4400,
    total: 26400,
    status: "sent",
  },
  {
    id: "c4",
    customer: "Café Riad",
    number: "VTE-2026-039",
    date: "2026-04-30",
    dueDate: "2026-05-30",
    amountHT: 3400,
    vat: 680,
    total: 4080,
    status: "overdue",
  },
  {
    id: "c5",
    customer: "Imprimerie Najah",
    number: "VTE-2026-043",
    date: "2026-05-29",
    dueDate: "2026-06-28",
    amountHT: 5600,
    vat: 1120,
    total: 6720,
    status: "draft",
  },
];

export const company = {
  name: "Argan Digital SARL",
  initials: "AD",
  legalForm: "SARL",
  address: "23 Bd Mohammed V",
  city: "Casablanca 20000",
  // Moroccan identifiers
  ice: "002145789000047",
  identifiantFiscal: "45321200",
  rc: "144521 — Casa",
  cnss: "3042156",
  // Activity
  activity: "Services informatiques et conseil",
  activityCode: "6201Z",
  startDate: "2020-03-15",
  // Fiscal
  taxMode: "IS — Impôt sur les Sociétés",
  vatRegime: "Déclaration mensuelle",
  // Active fiscal year — this is the "exercice ouvert"
  activeYear: 2026,
  fiscalYearStart: "2026-01-01",
  fiscalYearEnd: "2026-12-31",
};

export interface BankAccount {
  id: string;
  label: string;
  bank: string;
  masked: string;
  currency: string;
  balance: number;
}

export const bankAccounts: BankAccount[] = [
  {
    id: "acc1",
    label: "Compte principal",
    bank: "Attijariwafa",
    masked: "****4021",
    currency: "MAD",
    balance: 142500,
  },
  {
    id: "acc2",
    label: "Compte secondaire",
    bank: "BMCE Bank of Africa",
    masked: "****8830",
    currency: "MAD",
    balance: 18320,
  },
];

// ---------------------------------------------------------------------------
// Fiscal years — list of all exercises for this company
// ---------------------------------------------------------------------------

export type FiscalYearStatus = "open" | "closed" | "future";

export interface FiscalYear {
  year: number;
  start: string;
  end: string;
  status: FiscalYearStatus;
}

export const fiscalYears: FiscalYear[] = [
  { year: 2024, start: "2024-01-01", end: "2024-12-31", status: "closed" },
  { year: 2025, start: "2025-01-01", end: "2025-12-31", status: "closed" },
  { year: 2026, start: "2026-01-01", end: "2026-12-31", status: "open" },
];

// Coverage for 2025 (historical — all months fully imported)
export const bankAccountCoverage2025: BankAccountCoverage[] = [
  {
    id: "acc1",
    name: "Attijariwafa ****4021",
    bank: "Attijariwafa",
    statements: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: 2025,
      status: "imported" as StatementStatus,
      importedAt: `2025-${String(i + 2 > 12 ? 1 : i + 2).padStart(2, "0")}-04`,
    })),
  },
  {
    id: "acc2",
    name: "BMCE ****8830",
    bank: "BMCE",
    statements: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: 2025,
      status: (i + 1 === 8 || i + 1 === 11 ? "imported" : "imported") as StatementStatus,
      importedAt: `2025-${String(i + 2 > 12 ? 1 : i + 2).padStart(2, "0")}-05`,
    })),
  },
];

export const userProfile = {
  name: "Youssef Bennani",
  initials: "YB",
  email: "y.bennani@argan.ma",
  phone: "+212 661 234 567",
  role: "Administrateur",
  language: "Français",
};

// ---------------------------------------------------------------------------
// Bank statement coverage — tracks which months have been imported per account
// ---------------------------------------------------------------------------

export type StatementStatus = "imported" | "missing" | "future";

export interface AccountStatement {
  month: number; // 1 = January … 12 = December
  year: number;
  status: StatementStatus;
  importedAt?: string; // ISO date
}

export interface BankAccountCoverage {
  id: string;
  name: string;
  bank: string;
  statements: AccountStatement[];
}

function makeCoverage(
  year: number,
  currentMonth: number,
  statuses: Record<number, "imported" | "missing">
): AccountStatement[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    if (month > currentMonth) return { month, year, status: "future" };
    const s = statuses[month] ?? "missing";
    if (s === "imported") {
      const nm = month < 12 ? month + 1 : 1;
      const ny = month < 12 ? year : year + 1;
      return {
        month,
        year,
        status: "imported",
        importedAt: `${ny}-${String(nm).padStart(2, "0")}-03`,
      };
    }
    return { month, year, status: "missing" };
  });
}

export const bankAccountCoverage: BankAccountCoverage[] = [
  {
    id: "acc1",
    name: "Attijariwafa ****4021",
    bank: "Attijariwafa",
    statements: makeCoverage(2026, 5, {
      1: "imported",
      2: "imported",
      3: "imported",
      4: "imported",
      5: "imported",
    }),
  },
  {
    id: "acc2",
    name: "BMCE ****8830",
    bank: "BMCE",
    statements: makeCoverage(2026, 5, {
      1: "imported",
      2: "missing",
      3: "imported",
      4: "missing",
      5: "imported",
    }),
  },
];
