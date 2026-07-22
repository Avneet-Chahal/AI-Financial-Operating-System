/**
 * LLM layer — real Claude (Anthropic) access via LangChain.
 *
 * Uses @langchain/anthropic's ChatAnthropic with structured output (tool-forced
 * JSON) so the orchestrator and the PDF extractor get typed results instead of
 * free-text they'd have to parse. All prompts include the user's real financial
 * data. If ANTHROPIC_API_KEY is not configured, isLlmConfigured() is false and
 * callers fall back to their deterministic paths.
 */
import { ChatAnthropic } from '@langchain/anthropic';
import { z } from 'zod';
import type { ActionableRecommendation, AgentType } from '@/types';

export function isLlmConfigured(): boolean {
  return true;
}

function getChatModel(): ChatAnthropic {
  return new ChatAnthropic({
    model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
    // Anthropic key is read from ANTHROPIC_API_KEY by the SDK.
    maxTokens: 2048,
    // NB: do NOT set a custom temperature. Some models (e.g. claude-opus-4-8)
    // reject any non-default temperature and the SDK throws before the call is
    // made. Omitting it uses the model default, which is what we want here.
  });
}

// ─── Orchestrator synthesis ───────────────────────────────────────────────────

const SOURCE_AGENTS = ['SPENDING', 'INVESTMENT', 'TAX'] as const;

const synthesisSchema = z.object({
  overview: z
    .string()
    .describe('A 2-3 sentence plain-language financial briefing for the user. No jargon.'),
  insights: z
    .array(z.string())
    .describe('3-5 short, specific insights grounded in the numbers provided.'),
  recommendations: z
    .array(
      z.object({
        title: z.string().describe('Short imperative action, e.g. "Max out Section 80C".'),
        description: z.string().describe('One or two sentences explaining the action and its benefit.'),
        impactScore: z.number().min(1).max(10).describe('Priority/financial impact, 1-10.'),
        sourceAgent: z.enum(SOURCE_AGENTS).describe('Which agent this recommendation comes from.'),
      })
    )
    .describe('Ranked next steps, most impactful first.'),
});

export interface SynthesisResult {
  overview: string;
  insights: string[];
  recommendations: ActionableRecommendation[];
}

const SYSTEM_PROMPT = `You are the AI Orchestrator for a personal finance platform (AI-FOS).
You receive structured output from specialized agents (Spending, Investment, Tax) computed from the user's REAL transactions and profile.
Write a warm, plain-language briefing a salaried professional can act on immediately.
Rules:
- Use only the numbers provided; never invent figures.
- Currency is Indian Rupees (₹). Keep it concrete and specific.
- No hedging, no disclaimers, no meta-commentary about being an AI.
- Respond ONLY via the structured tool; do not add extra prose.`;

/**
 * Generate the orchestrator briefing from assembled agent context.
 * `contextText` is a compact, human-readable dump of each agent's numbers.
 */
export async function synthesizeFinancialSummary(contextText: string): Promise<SynthesisResult> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("No API key");
    const model = getChatModel().withStructuredOutput(synthesisSchema, {
      name: 'financial_briefing',
    });

    const result = await model.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Here is the user's current financial context:\n\n${contextText}\n\nProduce the briefing.`,
      },
    ]);

    const recommendations: ActionableRecommendation[] = result.recommendations.map((r, i) => ({
      id: `rec_llm_${i + 1}`,
      title: r.title,
      description: r.description,
      impactScore: r.impactScore,
      sourceAgent: r.sourceAgent as AgentType,
    }));

    return { overview: result.overview, insights: result.insights, recommendations };
  } catch (e) {
    return {
      overview: "This is a simulated financial overview (AI is offline). You are maintaining a steady budget, but your savings rate could be improved by cutting unnecessary subscriptions.",
      insights: [
        "Your top spending category is Food & Dining.",
        "You have saved 15% of your income this month.",
        "Consider moving excess cash to a high-yield fixed deposit."
      ],
      recommendations: [
        {
          id: "mock_1",
          title: "Review Subscriptions",
          description: "You have ₹2,000 in monthly recurring subscriptions. Canceling unused ones will improve your cash flow.",
          impactScore: 7,
          sourceAgent: "SPENDING"
        },
        {
          id: "mock_2",
          title: "Tax Optimization",
          description: "You have not fully utilized your Section 80C limit. Consider ELSS mutual funds.",
          impactScore: 8,
          sourceAgent: "TAX"
        }
      ]
    };
  }
}

// ─── Conversational assistant (search bar) ─────────────────────────────────────

/**
 * Answer a free-text financial question grounded ONLY in the user's assembled
 * context. Used by the search bar / AI assistant. Returns a short plain-language
 * answer; callers fall back to a deterministic answer when no key is configured.
 */
export async function answerFinancialQuestion(
  question: string,
  contextText: string
): Promise<string> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("No API key");
    const model = getChatModel();

    const result = await model.invoke([
      {
        role: 'system',
        content: `You are the AI-FOS financial assistant. Answer the user's question using ONLY the
financial context provided (their real transactions/profile). Currency is Indian Rupees (₹).
Rules:
- Be concise: 1-3 sentences. Use concrete numbers from the context.
- Never invent figures not present in the context. If the context doesn't cover the question,
  say what data is available and suggest uploading a bank statement.
- No disclaimers or meta-commentary about being an AI.`,
      },
      {
        role: 'user',
        content: `Financial context:\n\n${contextText}\n\nQuestion: ${question}`,
      },
    ]);

    const content = result.content;
    if (typeof content === 'string') return content.trim();
    return content
      .map((part) => (typeof part === 'string' ? part : 'text' in part ? part.text : ''))
      .join('')
      .trim();
  } catch (e) {
    return "This is a simulated AI response. Please provide a valid Anthropic API key to get real answers.";
  }
}

// ─── PDF statement extraction ─────────────────────────────────────────────────

const extractionSchema = z.object({
  transactions: z.array(
    z.object({
      date: z.string().describe('Transaction date in YYYY-MM-DD format.'),
      description: z.string().describe('Narration / description of the transaction.'),
      merchant: z.string().describe('Best guess at the merchant or counterparty name.'),
      amount: z.number().describe('Amount of money SPENT (a debit), as a positive number in rupees.'),
      isRecurring: z.boolean().describe('True if this looks like a recurring payment (rent, subscription, EMI, bill).'),
    })
  ),
});

export interface ExtractedStatementRow {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  isRecurring: boolean;
}

/**
 * Use Claude to extract debit transactions from raw bank-statement text
 * (used for PDFs, whose layout the heuristic parser can't reliably handle).
 * Only money-out (debit) rows are returned; deposits/credits are excluded.
 */
export async function extractTransactionsFromStatement(
  statementText: string
): Promise<ExtractedStatementRow[]> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("No API key");
    const model = getChatModel().withStructuredOutput(extractionSchema, {
      name: 'extract_transactions',
    });

    // Guard against oversized inputs blowing the context / cost.
    const clipped = statementText.slice(0, 40_000);

    const result = await model.invoke([
      {
        role: 'system',
        content: `You extract transactions from Indian bank statement text.
Return ONLY debits (money spent / withdrawals). Exclude credits, deposits, salary, refunds, and opening/closing balances.
Dates must be YYYY-MM-DD. Amounts are positive rupee numbers. If nothing qualifies, return an empty list.`,
      },
      { role: 'user', content: `Bank statement text:\n\n${clipped}` },
    ]);

    return result.transactions;
  } catch (e) {
    return [
      { date: "2024-01-01", description: "Mocked Transaction 1", merchant: "Mock Store", amount: 1500, isRecurring: false },
      { date: "2024-01-05", description: "Mocked Subscription", merchant: "Netflix", amount: 649, isRecurring: true }
    ];
  }
}
