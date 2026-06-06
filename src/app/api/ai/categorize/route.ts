import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getRemainingBudget, consumeBudget } from "@/lib/ai-budget";

type TxCategory =
  | "customer_payment" | "supplier_payment" | "software" | "rent"
  | "telecom" | "transport" | "meals" | "marketing" | "supplies"
  | "utilities" | "salary" | "cnss" | "tax_is" | "tax_tva"
  | "tax_other" | "bank_fee" | "transfer" | "withdrawal" | "other";

type VatRate = "20" | "14" | "10" | "7" | "0" | "exempt";

interface TxInput {
  id: string;
  label: string;
  amount: number;
}

interface AiResult {
  id: string;
  category: TxCategory;
  vat: VatRate;
  confidence: number;
}

const VALID_CATEGORIES = new Set<string>([
  "customer_payment", "supplier_payment", "software", "rent", "telecom",
  "transport", "meals", "marketing", "supplies", "utilities", "salary",
  "cnss", "tax_is", "tax_tva", "tax_other", "bank_fee", "transfer",
  "withdrawal", "other",
]);
const VALID_VAT = new Set<string>(["20", "14", "10", "7", "0", "exempt"]);

// Keyword fallback used when ANTHROPIC_API_KEY is not configured
function keywordCategorize(label: string, amount: number): { c: TxCategory; t: VatRate } {
  const l = label.toLowerCase();
  if (/loyer|bail|immo|gérance/.test(l)) return { c: "rent", t: "exempt" };
  if (/salaire|sal |vir pers|personnel/.test(l)) return { c: "salary", t: "exempt" };
  if (/tva|dgi|impôt|taxe/.test(l)) return { c: "tax_tva", t: "exempt" };
  if (/\bis\b|impôt société/.test(l)) return { c: "tax_is", t: "exempt" };
  if (/cnss/.test(l)) return { c: "cnss", t: "exempt" };
  if (/frais|tenue compte|commission bancaire/.test(l)) return { c: "bank_fee", t: "exempt" };
  if (/marjane|carrefour|acima|label'?vie|aswak/.test(l)) return { c: "supplies", t: "20" };
  if (/total|shell|afriquia|ziz|carburant/.test(l)) return { c: "transport", t: "10" };
  if (/telecom|inwi|orange|maroc telecom|internet|4g/.test(l)) return { c: "telecom", t: "20" };
  if (/restaurant|café|cafe|brasserie|restaur/.test(l)) return { c: "meals", t: "10" };
  if (/aws|azure|github|notion|saas|logiciel|cloud/.test(l)) return { c: "software", t: "20" };
  if (/eau|onee|radeema|lydec|amendis/.test(l)) return { c: "utilities", t: "14" };
  if (/pub|marketing|facebook|google ads|meta/.test(l)) return { c: "marketing", t: "20" };
  if (amount > 0) return { c: "customer_payment", t: "0" };
  return { c: "supplier_payment", t: "20" };
}

function buildPrompt(transactions: TxInput[]): string {
  const lines = transactions
    .map((t, i) => `${i + 1}|${t.id}|${t.label}|${t.amount}`)
    .join("\n");

  return `Tu es expert-comptable marocain. Catégorise ces transactions bancaires.

CATÉGORIES: customer_payment|supplier_payment|rent|telecom|transport|meals|software|supplies|salary|bank_fee|tax_tva|tax_is|tax_other|cnss|marketing|utilities|transfer|withdrawal|other

TVA: 20|14|10|7|0|exempt

RÈGLES:
- Loyer/bail → rent, exempt
- Salaire → salary, exempt
- TVA/DGI → tax_tva, exempt
- IS → tax_is, exempt
- CNSS → cnss, exempt
- Frais bancaires/tenue compte → bank_fee, exempt
- Restaurant/café → meals, 10
- Carburant/transport → transport, 10
- Eau/électricité/ONEE/Lydec → utilities, 14
- Télécom/internet → telecom, 20
- Logiciel/SaaS/cloud → software, 20
- Marketing/pub → marketing, 20
- Virement reçu (montant positif) → customer_payment, 0
- Achat fournisseur → supplier_payment, 20

TRANSACTIONS (n|id|libellé|montant_MAD):
${lines}

Réponds UNIQUEMENT avec un tableau JSON compact, aucun texte avant/après:
[{"i":"id","c":"catégorie","t":"tva","q":0.9},...]`;
}

export async function POST(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id") ?? "anonymous";
  const remaining = getRemainingBudget(sessionId);

  if (remaining <= 0) {
    return NextResponse.json(
      { error: "Budget IA épuisé pour cette session." },
      { status: 429 }
    );
  }

  const { transactions } = (await req.json()) as { transactions: TxInput[] };

  if (!transactions?.length) {
    return NextResponse.json({ results: [] });
  }

  // No API key — use keyword matching with simulated delay (demo mode)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-key-here") {
    const delay = Math.min(800 + transactions.length * 12, 2500);
    await new Promise((r) => setTimeout(r, delay));
    const results: AiResult[] = transactions.map((t) => {
      const { c, t: vat } = keywordCategorize(t.label, t.amount);
      return { id: t.id, category: c, vat, confidence: 0.75 };
    });
    return NextResponse.json({ results, tokensUsed: 0, remaining });
  }

  // Real AI call
  const client = new Anthropic({ apiKey });
  const MAX_TOKENS = Math.min(1800, remaining);

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: buildPrompt(transactions) }],
    });

    const used = message.usage.input_tokens + message.usage.output_tokens;
    consumeBudget(sessionId, used);

    const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";

    // Parse AI JSON, tolerating minor formatting issues
    const jsonStr = raw.startsWith("[") ? raw : raw.slice(raw.indexOf("["));
    const parsed = JSON.parse(jsonStr) as Array<{
      i: string; c: string; t: string; q?: number;
    }>;

    const results: AiResult[] = parsed
      .filter((r) => VALID_CATEGORIES.has(r.c) && VALID_VAT.has(r.t))
      .map((r) => ({
        id: r.i,
        category: r.c as TxCategory,
        vat: r.t as VatRate,
        confidence: r.q ?? 0.8,
      }));

    return NextResponse.json({
      results,
      tokensUsed: used,
      remaining: getRemainingBudget(sessionId),
    });
  } catch (err) {
    console.error("AI categorize error:", err);
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
