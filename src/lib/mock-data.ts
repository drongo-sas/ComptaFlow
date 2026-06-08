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
    fileUrl: "https://pub-f81cd2c8eb2b46049d9680f0c4884eb9.r2.dev/receipts/69c060c7381881be45def1eb/732d1bd9-bd93-46d2-9fc5-ded093648bd7.pdf",
    fileType: "pdf",
  },
];

export interface Expense {
  id: string;
  date: string;
  category: TxCategory;
  description: string;
  amountHT: number;
  vatRate: "20" | "14" | "10" | "7" | "0" | "exempt";
  vat: number;
  total: number;
  paidBy: "company_card" | "employee" | "cash";
  status: "pending" | "validated" | "reimbursed" | "rejected";
  submittedBy: string;
  notes?: string;
  receiptUrl?: string;
  receiptType?: "image" | "pdf";
}

export const expenses: Expense[] = [
  { id:"e1",  date:"2026-06-05", category:"meals",     description:"Déjeuner client — Atlas Distribution SARL", amountHT:416.67,  vatRate:"10", vat:41.67,  total:458.34,  paidBy:"employee",     status:"pending",    submittedBy:"Yassine B." },
  { id:"e2",  date:"2026-06-04", category:"transport", description:"Taxi Aéroport Mohammed V → Casablanca",     amountHT:250,     vatRate:"14", vat:35,     total:285,     paidBy:"company_card", status:"validated",  submittedBy:"Yassine B." },
  { id:"e3",  date:"2026-06-03", category:"supplies",  description:"Fournitures bureau — papeterie",             amountHT:583.33,  vatRate:"20", vat:116.67, total:700,     paidBy:"employee",     status:"pending",    submittedBy:"Fatima Z." },
  { id:"e4",  date:"2026-06-02", category:"software",  description:"Abonnement Figma — juin 2026",               amountHT:500,     vatRate:"20", vat:100,    total:600,     paidBy:"company_card", status:"validated",  submittedBy:"Système" },
  { id:"e5",  date:"2026-05-30", category:"transport", description:"Hébergement Hôtel Sofitel Rabat",            amountHT:2500,    vatRate:"10", vat:250,    total:2750,    paidBy:"company_card", status:"validated",  submittedBy:"Karim O." },
  { id:"e6",  date:"2026-05-28", category:"meals",     description:"Repas équipe — fin de sprint mai",          amountHT:833.33,  vatRate:"10", vat:83.33,  total:916.66,  paidBy:"employee",     status:"reimbursed", submittedBy:"Yassine B." },
  { id:"e7",  date:"2026-05-25", category:"transport", description:"Carburant — déplacement Rabat",              amountHT:400,     vatRate:"10", vat:40,     total:440,     paidBy:"cash",         status:"rejected",   submittedBy:"Karim O.", notes:"Justificatif manquant" },
  { id:"e8",  date:"2026-05-20", category:"marketing", description:"Impression plaquettes commerciales",         amountHT:1666.67, vatRate:"20", vat:333.33, total:2000,    paidBy:"company_card", status:"reimbursed", submittedBy:"Fatima Z." },
  { id:"e9",  date:"2026-05-15", category:"telecom",   description:"Facture Maroc Telecom — ligne pro",         amountHT:416.67,  vatRate:"20", vat:83.33,  total:500,     paidBy:"company_card", status:"validated",  submittedBy:"Système" },
  { id:"e10", date:"2026-05-10", category:"meals",     description:"Déjeuner partenaires — Groupe Saham",       amountHT:1250,    vatRate:"10", vat:125,    total:1375,    paidBy:"employee",     status:"reimbursed", submittedBy:"Karim O." },
];

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // HT per unit
  vatRate: "20" | "14" | "10" | "7" | "0" | "exempt";
}

export interface CustomerInvoice {
  id: string;
  customer: string;
  customerAddress?: string;
  customerCity?: string;
  customerICE?: string;
  customerIF?: string;
  number: string;
  date: string;
  dueDate: string;
  amountHT: number;
  vat: number;
  total: number;
  status: "draft" | "sent" | "partial" | "paid" | "overdue";
  items: InvoiceLineItem[];
  notes?: string;
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
    items: [
      { id: "c1-1", description: "Développement application web", quantity: 1, unitPrice: 10000, vatRate: "20" },
      { id: "c1-2", description: "Maintenance mensuelle", quantity: 3, unitPrice: 1125, vatRate: "20" },
      { id: "c1-3", description: "Formation utilisateurs", quantity: 1, unitPrice: 2000, vatRate: "20" },
    ],
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
    items: [
      { id: "c2-1", description: "Intégration API bancaire", quantity: 1, unitPrice: 7500, vatRate: "20" },
      { id: "c2-2", description: "Support technique", quantity: 5, unitPrice: 550, vatRate: "20" },
    ],
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
    items: [
      { id: "c3-1", description: "Audit système informatique", quantity: 1, unitPrice: 15000, vatRate: "20" },
      { id: "c3-2", description: "Rapport de conformité RGPD", quantity: 1, unitPrice: 5000, vatRate: "20" },
      { id: "c3-3", description: "Accompagnement mise en conformité", quantity: 4, unitPrice: 500, vatRate: "20" },
    ],
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
    items: [
      { id: "c4-1", description: "Création site vitrine et réservation", quantity: 1, unitPrice: 3000, vatRate: "20" },
      { id: "c4-2", description: "Configuration messagerie professionnelle", quantity: 1, unitPrice: 400, vatRate: "20" },
    ],
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
    items: [
      { id: "c5-1", description: "Développement catalogue produits en ligne", quantity: 1, unitPrice: 4500, vatRate: "20" },
      { id: "c5-2", description: "Hébergement et nom de domaine (1 an)", quantity: 1, unitPrice: 1100, vatRate: "20" },
    ],
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
  tp: "32456789",
  rib: "007 780 0002145789000047 34",
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

// ---------------------------------------------------------------------------
// Dossier data — per-client health view for the accountant portal
// ---------------------------------------------------------------------------

export interface DossierMonth {
  month: number; // 1-12
  year: number;
  status: "imported" | "missing" | "future";
}

export interface DossierBankAccount {
  name: string;
  bank: string;
  months: DossierMonth[];
}

export type DossierTodoCategory =
  | "transactions"
  | "supplier_invoices"
  | "expenses"
  | "customer_invoices"
  | "tva";

export interface DossierTodo {
  id: string;
  category: DossierTodoCategory;
  label: string;
  count: number;
  severity: "urgent" | "normal";
  href: string;
}

export interface ClientDossier {
  clientId: string;
  lastSync: string; // ISO datetime
  bankAccounts: DossierBankAccount[];
  todos: DossierTodo[];
}

function dossierMonths(
  year: number,
  currentMonth: number,
  map: Record<number, "imported" | "missing">,
): DossierMonth[] {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    if (month > currentMonth) return { month, year, status: "future" };
    return { month, year, status: map[month] ?? "missing" };
  });
}

const CUR = 5; // last complete month (May 2026 — June statement not yet available)
const YR  = 2026;

export const clientDossiers: ClientDossier[] = [
  {
    // Argan Digital — amber: 2 missing BMCE months + 2 todo categories
    clientId: "cl1",
    lastSync: "2026-06-05T14:23:00",
    bankAccounts: [
      {
        name: "Attijariwafa ****4021",
        bank: "Attijariwafa",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"imported",3:"imported",4:"imported",5:"imported" }),
      },
      {
        name: "BMCE ****8830",
        bank: "BMCE",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"missing",3:"imported",4:"missing",5:"imported" }),
      },
    ],
    todos: [
      { id:"cl1-t1", category:"transactions",     label:"Transactions non catégorisées",           count:4, severity:"urgent", href:"/bank-transactions" },
      { id:"cl1-t2", category:"supplier_invoices", label:"Factures fournisseurs sans TVA validée",  count:2, severity:"normal", href:"/supplier-invoices" },
    ],
  },
  {
    // Atlas Distribution — red: 5 missing bank months + urgent todos
    clientId: "cl2",
    lastSync: "2026-06-03T09:15:00",
    bankAccounts: [
      {
        name: "CIH Bank ****3301",
        bank: "CIH Bank",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"imported",3:"missing",4:"missing",5:"missing" }),
      },
      {
        name: "BCP ****7712",
        bank: "BCP",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"missing",3:"missing",4:"missing",5:"missing" }),
      },
    ],
    todos: [
      { id:"cl2-t1", category:"transactions", label:"Transactions non catégorisées",        count:7, severity:"urgent", href:"/bank-transactions" },
      { id:"cl2-t2", category:"expenses",     label:"Dépenses en attente de validation",    count:5, severity:"urgent", href:"/expenses" },
      { id:"cl2-t3", category:"tva",          label:"TVA avril — déclaration en retard",    count:1, severity:"urgent", href:"/bank-transactions" },
    ],
  },
  {
    // Techno Plus — green: all good
    clientId: "cl3",
    lastSync: "2026-06-05T08:00:00",
    bankAccounts: [
      {
        name: "Attijariwafa ****6610",
        bank: "Attijariwafa",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"imported",3:"imported",4:"imported",5:"imported" }),
      },
    ],
    todos: [],
  },
  {
    // Groupe Saham — amber: 3 factures à valider
    clientId: "cl4",
    lastSync: "2026-06-04T11:45:00",
    bankAccounts: [
      {
        name: "BMCE ****2290",
        bank: "BMCE",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"imported",3:"imported",4:"imported",5:"imported" }),
      },
      {
        name: "Société Générale ****5501",
        bank: "Société Générale",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"imported",3:"imported",4:"imported",5:"imported" }),
      },
    ],
    todos: [
      { id:"cl4-t1", category:"supplier_invoices", label:"Factures fournisseurs à valider",  count:3, severity:"normal", href:"/supplier-invoices" },
    ],
  },
  {
    // Café Riad — red: invitation pending + several missing
    clientId: "cl5",
    lastSync: "2026-05-20T16:00:00",
    bankAccounts: [
      {
        name: "Attijariwafa ****0812",
        bank: "Attijariwafa",
        months: dossierMonths(YR, CUR, { 1:"imported",2:"imported",3:"missing",4:"missing",5:"missing" }),
      },
    ],
    todos: [
      { id:"cl5-t1", category:"transactions",     label:"Transactions non catégorisées",        count:3, severity:"urgent", href:"/bank-transactions" },
      { id:"cl5-t2", category:"supplier_invoices", label:"Factures fournisseurs à valider",      count:1, severity:"normal", href:"/supplier-invoices" },
      { id:"cl5-t3", category:"expenses",          label:"Dépenses en attente de validation",    count:2, severity:"normal", href:"/expenses" },
    ],
  },
];

export function getDossier(clientId: string): ClientDossier | undefined {
  return clientDossiers.find((d) => d.clientId === clientId);
}

// ---------------------------------------------------------------------------
// Fiscal calendar — per-client obligation tracking (primary accountant view)
// ---------------------------------------------------------------------------

export type ObligationType = "tva" | "cnss" | "is_acompte" | "bilan";
export type ObligationStatus = "declared" | "to_prepare" | "late" | "na" | "future";

export interface ObligationBlocker {
  label: string;
  href: string; // deep-link into company workspace
}

export interface ObligationCell {
  month: number; // 1-12
  status: ObligationStatus;
  deadline?: string; // ISO date — only when status is to_prepare or late
  blockers?: ObligationBlocker[];
}

export interface FiscalRow {
  type: ObligationType;
  label: string;
  sublabel: string;
  cells: ObligationCell[]; // 12 entries, one per month
}

export interface ClientFiscalCalendar {
  clientId: string;
  rows: FiscalRow[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function cell(month: number, status: ObligationStatus, deadline?: string, blockers?: ObligationBlocker[]): ObligationCell {
  return { month, status, deadline, blockers };
}

const D = cell; // alias for brevity
const NA   = (m: number): ObligationCell => D(m, "na");
const OK   = (m: number): ObligationCell => D(m, "declared");
const FUT  = (m: number): ObligationCell => D(m, "future");
const LATE = (m: number, deadline: string, blockers?: ObligationBlocker[]): ObligationCell =>
  D(m, "late", deadline, blockers);
const PREP = (m: number, deadline: string, blockers?: ObligationBlocker[]): ObligationCell =>
  D(m, "to_prepare", deadline, blockers);

// ── Per-client fiscal calendars ───────────────────────────────────────────────

export const clientFiscalCalendars: ClientFiscalCalendar[] = [
  {
    // cl1 — Argan Digital: mostly good, TVA/CNSS may in progress, IS Q2 upcoming
    clientId: "cl1",
    rows: [
      {
        type: "tva", label: "TVA mensuelle", sublabel: "Déclaration CA3",
        cells: [
          OK(1), OK(2), OK(3), OK(4),
          PREP(5, "2026-06-20", [
            { label: "4 transactions non catégorisées", href: "/bank-transactions" },
            { label: "Relevé BMCE février manquant", href: "/settings/accounts" },
          ]),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "cnss", label: "CNSS / Salaires", sublabel: "Cotisations sociales",
        cells: [
          OK(1), OK(2), OK(3), OK(4),
          PREP(5, "2026-06-30", [
            { label: "Validation paie mai en attente", href: "/expenses" },
          ]),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "is_acompte", label: "IS Acompte", sublabel: "Paiement trimestriel",
        cells: [
          NA(1), NA(2), OK(3), NA(4), NA(5),
          PREP(6, "2026-06-30"),
          NA(7), NA(8), FUT(9), NA(10), NA(11), FUT(12),
        ],
      },
      {
        type: "bilan", label: "Bilan annuel", sublabel: "Exercice 2025",
        cells: [
          NA(1), NA(2), OK(3),
          NA(4), NA(5), NA(6), NA(7), NA(8), NA(9), NA(10), NA(11), NA(12),
        ],
      },
    ],
  },
  {
    // cl2 — Atlas Distribution: RED — several late declarations
    clientId: "cl2",
    rows: [
      {
        type: "tva", label: "TVA mensuelle", sublabel: "Déclaration CA3",
        cells: [
          OK(1), OK(2),
          LATE(3, "2026-04-20", [
            { label: "7 transactions non catégorisées", href: "/bank-transactions" },
            { label: "Relevé CIH mars manquant", href: "/settings/accounts" },
          ]),
          LATE(4, "2026-05-20", [
            { label: "Relevé CIH avril manquant", href: "/settings/accounts" },
            { label: "Relevé BCP avril manquant", href: "/settings/accounts" },
          ]),
          LATE(5, "2026-06-20", [
            { label: "Mois précédents non déclarés", href: "/bank-transactions" },
            { label: "5 dépenses non validées", href: "/expenses" },
          ]),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "cnss", label: "CNSS / Salaires", sublabel: "Cotisations sociales",
        cells: [
          OK(1), OK(2), OK(3),
          LATE(4, "2026-05-31", [
            { label: "Paie avril non validée", href: "/expenses" },
          ]),
          LATE(5, "2026-06-30", [
            { label: "Paie mai non validée", href: "/expenses" },
          ]),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "is_acompte", label: "IS Acompte", sublabel: "Paiement trimestriel",
        cells: [
          NA(1), NA(2), OK(3), NA(4), NA(5),
          PREP(6, "2026-06-30"),
          NA(7), NA(8), FUT(9), NA(10), NA(11), FUT(12),
        ],
      },
      {
        type: "bilan", label: "Bilan annuel", sublabel: "Exercice 2025",
        cells: [
          NA(1), NA(2),
          LATE(3, "2026-03-31"),
          NA(4), NA(5), NA(6), NA(7), NA(8), NA(9), NA(10), NA(11), NA(12),
        ],
      },
    ],
  },
  {
    // cl3 — Techno Plus: GREEN — everything declared, nothing urgent
    clientId: "cl3",
    rows: [
      {
        type: "tva", label: "TVA mensuelle", sublabel: "Déclaration CA3",
        cells: [
          OK(1), OK(2), OK(3), OK(4), OK(5),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "cnss", label: "CNSS / Salaires", sublabel: "Cotisations sociales",
        cells: [
          OK(1), OK(2), OK(3), OK(4), OK(5),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "is_acompte", label: "IS Acompte", sublabel: "Paiement trimestriel",
        cells: [
          NA(1), NA(2), OK(3), NA(4), NA(5),
          FUT(6), NA(7), NA(8), FUT(9), NA(10), NA(11), FUT(12),
        ],
      },
      {
        type: "bilan", label: "Bilan annuel", sublabel: "Exercice 2025",
        cells: [
          NA(1), NA(2), OK(3),
          NA(4), NA(5), NA(6), NA(7), NA(8), NA(9), NA(10), NA(11), NA(12),
        ],
      },
    ],
  },
  {
    // cl4 — Groupe Saham: AMBER — TVA mai to prepare
    clientId: "cl4",
    rows: [
      {
        type: "tva", label: "TVA mensuelle", sublabel: "Déclaration CA3",
        cells: [
          OK(1), OK(2), OK(3), OK(4),
          PREP(5, "2026-06-20", [
            { label: "3 factures fournisseurs à valider", href: "/supplier-invoices" },
          ]),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "cnss", label: "CNSS / Salaires", sublabel: "Cotisations sociales",
        cells: [
          OK(1), OK(2), OK(3), OK(4), OK(5),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "is_acompte", label: "IS Acompte", sublabel: "Paiement trimestriel",
        cells: [
          NA(1), NA(2), OK(3), NA(4), NA(5),
          PREP(6, "2026-06-30"),
          NA(7), NA(8), FUT(9), NA(10), NA(11), FUT(12),
        ],
      },
      {
        type: "bilan", label: "Bilan annuel", sublabel: "Exercice 2025",
        cells: [
          NA(1), NA(2), OK(3),
          NA(4), NA(5), NA(6), NA(7), NA(8), NA(9), NA(10), NA(11), NA(12),
        ],
      },
    ],
  },
  {
    // cl5 — Café Riad: RED — multiple late + pending invite
    clientId: "cl5",
    rows: [
      {
        type: "tva", label: "TVA mensuelle", sublabel: "Déclaration CA3",
        cells: [
          OK(1),
          LATE(2, "2026-03-20", [
            { label: "Accès dossier non accordé", href: "/settings/accountant" },
          ]),
          LATE(3, "2026-04-20"),
          LATE(4, "2026-05-20"),
          LATE(5, "2026-06-20"),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "cnss", label: "CNSS / Salaires", sublabel: "Cotisations sociales",
        cells: [
          OK(1),
          LATE(2, "2026-03-31"),
          LATE(3, "2026-04-30"),
          LATE(4, "2026-05-31"),
          LATE(5, "2026-06-30"),
          FUT(6), FUT(7), FUT(8), FUT(9), FUT(10), FUT(11), FUT(12),
        ],
      },
      {
        type: "is_acompte", label: "IS Acompte", sublabel: "Paiement trimestriel",
        cells: [
          NA(1), NA(2),
          LATE(3, "2026-03-31"),
          NA(4), NA(5),
          PREP(6, "2026-06-30"),
          NA(7), NA(8), FUT(9), NA(10), NA(11), FUT(12),
        ],
      },
      {
        type: "bilan", label: "Bilan annuel", sublabel: "Exercice 2025",
        cells: [
          NA(1), NA(2),
          LATE(3, "2026-03-31"),
          NA(4), NA(5), NA(6), NA(7), NA(8), NA(9), NA(10), NA(11), NA(12),
        ],
      },
    ],
  },
];

export function getFiscalCalendar(clientId: string): ClientFiscalCalendar | undefined {
  return clientFiscalCalendars.find((c) => c.clientId === clientId);
}

// ---------------------------------------------------------------------------
// Monthly preparation — pre-accounting completeness per month (primary view)
// ---------------------------------------------------------------------------

export type MonthStatus =
  | "not_started"   // nothing imported yet
  | "in_progress"   // partially complete
  | "waiting_client"// blocked — client hasn't sent documents/statements
  | "ready_export"  // 100% complete, accountant can export
  | "exported";     // exported to accounting software

export interface MonthPrep {
  month: number; // 1-12
  year: number;
  status: MonthStatus;
  bank:          { imported: number; total: number };
  docs:          { reviewed: number; total: number };
  transactions:  { categorized: number; total: number };
  reconciliation:{ matched: number; total: number };
  openRequests:  number;
  blockers:      Array<{ label: string; href: string }>;
  exportedAt?:   string; // ISO date
}

export interface ClientPreparation {
  clientId: string;
  lastActivity: string; // ISO datetime
  months: MonthPrep[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function exp(m: number, exportedAt: string): MonthPrep {
  return {
    month: m, year: 2026, status: "exported",
    bank: { imported: 2, total: 2 }, docs: { reviewed: 30, total: 30 },
    transactions: { categorized: 55, total: 55 }, reconciliation: { matched: 48, total: 48 },
    openRequests: 0, blockers: [], exportedAt,
  };
}

function exp1(m: number, exportedAt: string): MonthPrep {
  return { ...exp(m, exportedAt), bank: { imported: 1, total: 1 }, transactions: { categorized: 42, total: 42 }, reconciliation: { matched: 36, total: 36 } };
}

function ns(m: number): MonthPrep {
  return {
    month: m, year: 2026, status: "not_started",
    bank: { imported: 0, total: 0 }, docs: { reviewed: 0, total: 0 },
    transactions: { categorized: 0, total: 0 }, reconciliation: { matched: 0, total: 0 },
    openRequests: 0, blockers: [],
  };
}

export const clientPreparations: ClientPreparation[] = [
  {
    // cl1 — Argan Digital: Jan–Mar exported, Apr ready, May in progress 72%
    clientId: "cl1",
    lastActivity: "2026-06-05T14:23:00",
    months: [
      exp(1, "2026-02-03"), exp(2, "2026-03-04"), exp(3, "2026-04-02"),
      {
        month: 4, year: 2026, status: "ready_export",
        bank: { imported: 2, total: 2 }, docs: { reviewed: 42, total: 42 },
        transactions: { categorized: 58, total: 58 }, reconciliation: { matched: 55, total: 55 },
        openRequests: 0, blockers: [],
      },
      {
        month: 5, year: 2026, status: "in_progress",
        bank: { imported: 1, total: 2 },
        docs: { reviewed: 18, total: 25 },
        transactions: { categorized: 38, total: 54 },
        reconciliation: { matched: 28, total: 42 },
        openRequests: 2,
        blockers: [
          { label: "Relevé BMCE mai manquant",               href: "/settings/accounts"   },
          { label: "4 transactions non catégorisées",        href: "/bank-transactions"   },
          { label: "7 factures non rapprochées",             href: "/supplier-invoices"   },
          { label: "2 demandes client sans réponse",         href: "/bank-transactions"   },
        ],
      },
      ns(6), ns(7), ns(8), ns(9), ns(10), ns(11), ns(12),
    ],
  },
  {
    // cl2 — Atlas Distribution: Jan–Feb exported, Mar–Apr waiting client, May 38%
    clientId: "cl2",
    lastActivity: "2026-06-03T09:15:00",
    months: [
      exp(1, "2026-02-05"), exp(2, "2026-03-06"),
      {
        month: 3, year: 2026, status: "waiting_client",
        bank: { imported: 0, total: 2 }, docs: { reviewed: 12, total: 28 },
        transactions: { categorized: 0, total: 0 }, reconciliation: { matched: 0, total: 0 },
        openRequests: 3,
        blockers: [
          { label: "Relevé CIH mars manquant",               href: "/settings/accounts" },
          { label: "Relevé BCP mars manquant",               href: "/settings/accounts" },
          { label: "3 demandes client en attente",           href: "/bank-transactions" },
        ],
      },
      {
        month: 4, year: 2026, status: "waiting_client",
        bank: { imported: 0, total: 2 }, docs: { reviewed: 8, total: 30 },
        transactions: { categorized: 0, total: 0 }, reconciliation: { matched: 0, total: 0 },
        openRequests: 4,
        blockers: [
          { label: "Relevé CIH avril manquant",              href: "/settings/accounts" },
          { label: "Relevé BCP avril manquant",              href: "/settings/accounts" },
          { label: "4 demandes client en attente",           href: "/bank-transactions" },
        ],
      },
      {
        month: 5, year: 2026, status: "in_progress",
        bank: { imported: 1, total: 2 }, docs: { reviewed: 9, total: 35 },
        transactions: { categorized: 22, total: 58 }, reconciliation: { matched: 12, total: 40 },
        openRequests: 5,
        blockers: [
          { label: "Relevé BCP mai manquant",                href: "/settings/accounts"  },
          { label: "7 transactions non catégorisées",        href: "/bank-transactions"  },
          { label: "5 dépenses non validées",                href: "/expenses"           },
          { label: "28 factures non rapprochées",            href: "/supplier-invoices"  },
        ],
      },
      ns(6), ns(7), ns(8), ns(9), ns(10), ns(11), ns(12),
    ],
  },
  {
    // cl3 — Techno Plus: Jan–Apr exported, May ready to export
    clientId: "cl3",
    lastActivity: "2026-06-05T08:00:00",
    months: [
      exp1(1, "2026-02-02"), exp1(2, "2026-03-03"), exp1(3, "2026-04-01"), exp1(4, "2026-05-02"),
      {
        month: 5, year: 2026, status: "ready_export",
        bank: { imported: 1, total: 1 }, docs: { reviewed: 22, total: 22 },
        transactions: { categorized: 38, total: 38 }, reconciliation: { matched: 31, total: 31 },
        openRequests: 0, blockers: [],
      },
      ns(6), ns(7), ns(8), ns(9), ns(10), ns(11), ns(12),
    ],
  },
  {
    // cl4 — Groupe Saham: Jan–Apr exported, May in progress 88%
    clientId: "cl4",
    lastActivity: "2026-06-04T11:45:00",
    months: [
      exp(1, "2026-02-04"), exp(2, "2026-03-05"), exp(3, "2026-04-03"), exp(4, "2026-05-04"),
      {
        month: 5, year: 2026, status: "in_progress",
        bank: { imported: 2, total: 2 }, docs: { reviewed: 45, total: 47 },
        transactions: { categorized: 68, total: 72 }, reconciliation: { matched: 61, total: 65 },
        openRequests: 1,
        blockers: [
          { label: "2 documents en attente de validation",   href: "/supplier-invoices"  },
          { label: "4 transactions non catégorisées",        href: "/bank-transactions"  },
          { label: "4 factures non rapprochées",             href: "/supplier-invoices"  },
        ],
      },
      ns(6), ns(7), ns(8), ns(9), ns(10), ns(11), ns(12),
    ],
  },
  {
    // cl5 — Café Riad: Jan exported, Feb+ blocked (invitation pending)
    clientId: "cl5",
    lastActivity: "2026-05-20T16:00:00",
    months: [
      exp1(1, "2026-02-06"),
      {
        month: 2, year: 2026, status: "waiting_client",
        bank: { imported: 0, total: 1 }, docs: { reviewed: 0, total: 15 },
        transactions: { categorized: 0, total: 0 }, reconciliation: { matched: 0, total: 0 },
        openRequests: 1,
        blockers: [
          { label: "Invitation client non acceptée",         href: "/settings/accountant" },
          { label: "Aucun document reçu depuis janvier",     href: "/supplier-invoices"   },
        ],
      },
      ns(3), ns(4), ns(5), ns(6), ns(7), ns(8), ns(9), ns(10), ns(11), ns(12),
    ],
  },
];

export function getPreparation(clientId: string): ClientPreparation | undefined {
  return clientPreparations.find((p) => p.clientId === clientId);
}

export function completionPct(m: MonthPrep): number {
  if (m.status === "exported" || m.status === "ready_export") return 100;
  if (m.status === "not_started") return 0;
  const dims = [
    m.bank.total         > 0 ? m.bank.imported          / m.bank.total          : 1,
    m.docs.total         > 0 ? m.docs.reviewed           / m.docs.total          : 1,
    m.transactions.total > 0 ? m.transactions.categorized/ m.transactions.total  : 1,
    m.reconciliation.total>0 ? m.reconciliation.matched  / m.reconciliation.total: 1,
  ];
  return Math.round((dims.reduce((a, b) => a + b, 0) / dims.length) * 100);
}

// ---------------------------------------------------------------------------
// Accounting clients — for the comptable (accountant) portal
// ---------------------------------------------------------------------------

export interface AccountingClient {
  id: string;
  name: string;
  initials: string;
  legalForm: string;
  ice: string;
  city: string;
  activity: string;
  linkedSince: string; // ISO date
  alerts: {
    invoices?: number;
    expenses?: number;
    transactions?: number;
  };
  status: "active" | "pending_invite";
  fiscalYear: number;
  templateId: string; // reference to FiscalTemplate
}

export const accountingClients: AccountingClient[] = [
  {
    id: "cl1",
    name: "Argan Digital SARL",
    initials: "AD",
    legalForm: "SARL",
    ice: "002145789000047",
    city: "Casablanca",
    activity: "Services informatiques et conseil",
    linkedSince: "2024-01-15",
    alerts: { transactions: 4, invoices: 2 },
    status: "active",
    fiscalYear: 2026,
    templateId: "sarl-standard",
  },
  {
    id: "cl2",
    name: "Atlas Distribution SARL",
    initials: "AT",
    legalForm: "SARL",
    ice: "003547821000012",
    city: "Rabat",
    activity: "Commerce de gros",
    linkedSince: "2024-03-20",
    alerts: { expenses: 5, transactions: 7 },
    status: "active",
    fiscalYear: 2026,
    templateId: "sarl-standard",
  },
  {
    id: "cl3",
    name: "Techno Plus SA",
    initials: "TP",
    legalForm: "SA",
    ice: "001234567000088",
    city: "Marrakech",
    activity: "Négoce de matériel informatique",
    linkedSince: "2024-06-01",
    alerts: {},
    status: "active",
    fiscalYear: 2026,
    templateId: "sa-holding",
  },
  {
    id: "cl4",
    name: "Groupe Saham",
    initials: "GS",
    legalForm: "SA",
    ice: "004789123000056",
    city: "Casablanca",
    activity: "Assurances et finances",
    linkedSince: "2025-01-10",
    alerts: { invoices: 3 },
    status: "active",
    fiscalYear: 2026,
    templateId: "sa-holding",
  },
  {
    id: "cl5",
    name: "Café Riad SARL",
    initials: "CR",
    legalForm: "SARL",
    ice: "005321654000099",
    city: "Fès",
    activity: "Restauration et hôtellerie",
    linkedSince: "2025-09-15",
    alerts: { invoices: 1, expenses: 2, transactions: 3 },
    status: "pending_invite",
    fiscalYear: 2026,
    templateId: "sarl-standard",
  },
];

// ---------------------------------------------------------------------------
// Fiscal templates — pre-built obligation calendars
// ---------------------------------------------------------------------------

export type ObligationRuleType =
  | "TVA" | "CNSS" | "IR" | "IS_acompte" | "bilan" | "cotisation" | "autre";

export interface ObligationRule {
  id: string;
  label: string;
  type: ObligationRuleType;
  periodicity: "monthly" | "quarterly" | "annual";
  dueDayOfMonth: number;
  activeMonths?: number[]; // e.g. [3,6,9,12] for quarterly IS
}

export interface FiscalTemplate {
  id: string;
  name: string;
  description: string;
  rules: ObligationRule[];
}

export const fiscalTemplates: FiscalTemplate[] = [
  {
    id: "sarl-standard",
    name: "SARL Standard",
    description: "TVA mensuelle · CNSS · IR salaires · IS acomptes trimestriels",
    rules: [
      { id: "tva-m",  label: "Déclaration TVA",          type: "TVA",        periodicity: "monthly",   dueDayOfMonth: 20 },
      { id: "cnss-m", label: "CNSS patronale",            type: "CNSS",       periodicity: "monthly",   dueDayOfMonth: 10 },
      { id: "ir-m",   label: "IR salaires",               type: "IR",         periodicity: "monthly",   dueDayOfMonth: 10 },
      { id: "is-q",   label: "IS acompte trimestriel",    type: "IS_acompte", periodicity: "quarterly", dueDayOfMonth: 31, activeMonths: [3,6,9,12] },
    ],
  },
  {
    id: "sa-holding",
    name: "SA / Holding",
    description: "TVA mensuelle · CNSS · IR · IS acomptes · DAS2 annuel",
    rules: [
      { id: "tva-m",  label: "Déclaration TVA",          type: "TVA",        periodicity: "monthly",   dueDayOfMonth: 20 },
      { id: "cnss-m", label: "CNSS patronale",            type: "CNSS",       periodicity: "monthly",   dueDayOfMonth: 10 },
      { id: "ir-m",   label: "IR salaires",               type: "IR",         periodicity: "monthly",   dueDayOfMonth: 10 },
      { id: "is-q",   label: "IS acompte trimestriel",    type: "IS_acompte", periodicity: "quarterly", dueDayOfMonth: 31, activeMonths: [3,6,9,12] },
      { id: "das2",   label: "DAS2",                      type: "autre",      periodicity: "annual",    dueDayOfMonth: 31, activeMonths: [1] },
    ],
  },
  {
    id: "auto-entrepreneur",
    name: "Auto-entrepreneur",
    description: "Cotisations trimestrielles simplifiées — IS et TVA inclus",
    rules: [
      { id: "cot-q", label: "Cotisation trimestrielle", type: "cotisation", periodicity: "quarterly", dueDayOfMonth: 30, activeMonths: [4,7,10,1] },
    ],
  },
];

export function getTemplate(id: string): FiscalTemplate | undefined {
  return fiscalTemplates.find((t) => t.id === id);
}

// ---------------------------------------------------------------------------
// Dossier obligations — per-client, per-period fiscal tasks
// ---------------------------------------------------------------------------

export type DossierObligationStatus = "pending" | "done" | "blocked" | "na";

export interface DossierObligation {
  id: string;
  clientId: string;
  templateId: string;
  ruleId: string;
  type: ObligationRuleType;
  label: string;       // "TVA Mai 2026"
  period: string;      // "Mai 2026"
  dueDate: string;     // ISO date "2026-06-20"
  status: DossierObligationStatus;
  doneAt?: string;
  note?: string;
}

export const dossierObligations: DossierObligation[] = [
  // ── Argan Digital (cl1 — sarl-standard) ──────────────────────────────────
  { id:"cl1-tva-apr",  clientId:"cl1", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Avril 2026",         period:"Avril 2026", dueDate:"2026-05-20", status:"pending" },
  { id:"cl1-cnss-may", clientId:"cl1", templateId:"sarl-standard", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Mai 2026",          period:"Mai 2026",   dueDate:"2026-06-10", status:"pending" },
  { id:"cl1-ir-may",   clientId:"cl1", templateId:"sarl-standard", ruleId:"ir-m",   type:"IR",         label:"IR salaires Mai 2026",   period:"Mai 2026",   dueDate:"2026-06-10", status:"pending" },
  { id:"cl1-tva-may",  clientId:"cl1", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Mai 2026",           period:"Mai 2026",   dueDate:"2026-06-20", status:"pending" },
  { id:"cl1-is-q2",    clientId:"cl1", templateId:"sarl-standard", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q2 2026",     period:"Q2 2026",    dueDate:"2026-06-30", status:"pending" },
  { id:"cl1-tva-mar",  clientId:"cl1", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Mars 2026",          period:"Mars 2026",  dueDate:"2026-04-20", status:"done",    doneAt:"2026-04-18" },
  { id:"cl1-cnss-apr", clientId:"cl1", templateId:"sarl-standard", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Avril 2026",        period:"Avril 2026", dueDate:"2026-05-10", status:"done",    doneAt:"2026-05-09" },
  { id:"cl1-ir-apr",   clientId:"cl1", templateId:"sarl-standard", ruleId:"ir-m",   type:"IR",         label:"IR salaires Avril 2026", period:"Avril 2026", dueDate:"2026-05-10", status:"done",    doneAt:"2026-05-08" },
  { id:"cl1-is-q1",    clientId:"cl1", templateId:"sarl-standard", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q1 2026",     period:"Q1 2026",    dueDate:"2026-03-31", status:"done",    doneAt:"2026-03-28" },

  // ── Atlas Distribution (cl2 — sarl-standard) ─────────────────────────────
  { id:"cl2-tva-mar",  clientId:"cl2", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Mars 2026",          period:"Mars 2026",  dueDate:"2026-04-20", status:"blocked", note:"Relevés CIH manquants" },
  { id:"cl2-tva-apr",  clientId:"cl2", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Avril 2026",         period:"Avril 2026", dueDate:"2026-05-20", status:"blocked", note:"Relevés BCP manquants" },
  { id:"cl2-cnss-may", clientId:"cl2", templateId:"sarl-standard", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Mai 2026",          period:"Mai 2026",   dueDate:"2026-06-10", status:"pending" },
  { id:"cl2-ir-may",   clientId:"cl2", templateId:"sarl-standard", ruleId:"ir-m",   type:"IR",         label:"IR salaires Mai 2026",   period:"Mai 2026",   dueDate:"2026-06-10", status:"pending" },
  { id:"cl2-tva-may",  clientId:"cl2", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Mai 2026",           period:"Mai 2026",   dueDate:"2026-06-20", status:"pending" },
  { id:"cl2-is-q2",    clientId:"cl2", templateId:"sarl-standard", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q2 2026",     period:"Q2 2026",    dueDate:"2026-06-30", status:"pending" },
  { id:"cl2-tva-jan",  clientId:"cl2", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Janvier 2026",       period:"Jan 2026",   dueDate:"2026-02-20", status:"done",    doneAt:"2026-02-18" },
  { id:"cl2-tva-fev",  clientId:"cl2", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Février 2026",       period:"Fév 2026",   dueDate:"2026-03-20", status:"done",    doneAt:"2026-03-19" },
  { id:"cl2-is-q1",    clientId:"cl2", templateId:"sarl-standard", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q1 2026",     period:"Q1 2026",    dueDate:"2026-03-31", status:"done",    doneAt:"2026-03-30" },

  // ── Techno Plus (cl3 — sa-holding) ─────────────────────────────────────
  { id:"cl3-cnss-may", clientId:"cl3", templateId:"sa-holding", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Mai 2026",          period:"Mai 2026",   dueDate:"2026-06-10", status:"done",    doneAt:"2026-06-05" },
  { id:"cl3-ir-may",   clientId:"cl3", templateId:"sa-holding", ruleId:"ir-m",   type:"IR",         label:"IR salaires Mai 2026",   period:"Mai 2026",   dueDate:"2026-06-10", status:"done",    doneAt:"2026-06-05" },
  { id:"cl3-tva-may",  clientId:"cl3", templateId:"sa-holding", ruleId:"tva-m",  type:"TVA",        label:"TVA Mai 2026",           period:"Mai 2026",   dueDate:"2026-06-20", status:"done",    doneAt:"2026-06-07" },
  { id:"cl3-is-q2",    clientId:"cl3", templateId:"sa-holding", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q2 2026",     period:"Q2 2026",    dueDate:"2026-06-30", status:"done",    doneAt:"2026-06-07" },
  { id:"cl3-tva-apr",  clientId:"cl3", templateId:"sa-holding", ruleId:"tva-m",  type:"TVA",        label:"TVA Avril 2026",         period:"Avril 2026", dueDate:"2026-05-20", status:"done",    doneAt:"2026-05-18" },
  { id:"cl3-cnss-apr", clientId:"cl3", templateId:"sa-holding", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Avril 2026",        period:"Avril 2026", dueDate:"2026-05-10", status:"done",    doneAt:"2026-05-09" },
  { id:"cl3-is-q1",    clientId:"cl3", templateId:"sa-holding", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q1 2026",     period:"Q1 2026",    dueDate:"2026-03-31", status:"done",    doneAt:"2026-03-28" },

  // ── Groupe Saham (cl4 — sa-holding) ────────────────────────────────────
  { id:"cl4-cnss-may", clientId:"cl4", templateId:"sa-holding", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Mai 2026",          period:"Mai 2026",   dueDate:"2026-06-10", status:"pending" },
  { id:"cl4-ir-may",   clientId:"cl4", templateId:"sa-holding", ruleId:"ir-m",   type:"IR",         label:"IR salaires Mai 2026",   period:"Mai 2026",   dueDate:"2026-06-10", status:"pending" },
  { id:"cl4-tva-may",  clientId:"cl4", templateId:"sa-holding", ruleId:"tva-m",  type:"TVA",        label:"TVA Mai 2026",           period:"Mai 2026",   dueDate:"2026-06-20", status:"pending" },
  { id:"cl4-is-q2",    clientId:"cl4", templateId:"sa-holding", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q2 2026",     period:"Q2 2026",    dueDate:"2026-06-30", status:"pending" },
  { id:"cl4-tva-apr",  clientId:"cl4", templateId:"sa-holding", ruleId:"tva-m",  type:"TVA",        label:"TVA Avril 2026",         period:"Avril 2026", dueDate:"2026-05-20", status:"done",    doneAt:"2026-05-19" },
  { id:"cl4-cnss-apr", clientId:"cl4", templateId:"sa-holding", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Avril 2026",        period:"Avril 2026", dueDate:"2026-05-10", status:"done",    doneAt:"2026-05-09" },
  { id:"cl4-is-q1",    clientId:"cl4", templateId:"sa-holding", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q1 2026",     period:"Q1 2026",    dueDate:"2026-03-31", status:"done",    doneAt:"2026-03-31" },

  // ── Café Riad (cl5 — sarl-standard, invitation pending) ──────────────────
  { id:"cl5-tva-fev",  clientId:"cl5", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Février 2026",       period:"Fév 2026",   dueDate:"2026-03-20", status:"blocked", note:"Invitation client non acceptée" },
  { id:"cl5-tva-mar",  clientId:"cl5", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Mars 2026",          period:"Mars 2026",  dueDate:"2026-04-20", status:"blocked", note:"Invitation client non acceptée" },
  { id:"cl5-tva-apr",  clientId:"cl5", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Avril 2026",         period:"Avril 2026", dueDate:"2026-05-20", status:"blocked", note:"Invitation client non acceptée" },
  { id:"cl5-cnss-may", clientId:"cl5", templateId:"sarl-standard", ruleId:"cnss-m", type:"CNSS",       label:"CNSS Mai 2026",          period:"Mai 2026",   dueDate:"2026-06-10", status:"blocked", note:"Invitation client non acceptée" },
  { id:"cl5-tva-may",  clientId:"cl5", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Mai 2026",           period:"Mai 2026",   dueDate:"2026-06-20", status:"blocked", note:"Invitation client non acceptée" },
  { id:"cl5-is-q2",    clientId:"cl5", templateId:"sarl-standard", ruleId:"is-q",   type:"IS_acompte", label:"IS Acompte Q2 2026",     period:"Q2 2026",    dueDate:"2026-06-30", status:"blocked", note:"Invitation client non acceptée" },
  { id:"cl5-tva-jan",  clientId:"cl5", templateId:"sarl-standard", ruleId:"tva-m",  type:"TVA",        label:"TVA Janvier 2026",       period:"Jan 2026",   dueDate:"2026-02-20", status:"done",    doneAt:"2026-02-17" },
];

export function getClientObligations(clientId: string): DossierObligation[] {
  return dossierObligations.filter((o) => o.clientId === clientId);
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
