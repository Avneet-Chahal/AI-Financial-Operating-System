/**
 * Bank statement parsing (CSV + PDF).
 *
 * Produces normalized ParsedTransaction rows that the upload API maps into the
 * Transaction schema. Only debits (money out) are imported, since AI-FOS tracks
 * spending; credits/deposits are ignored.
 *
 * - CSV  → papaparse with fuzzy header detection (works across bank export formats).
 * - PDF  → pdf-parse extracts text, then a heuristic line parser structures it.
 *          When an Anthropic key is configured, the LLM extractor (llm.ts) takes
 *          over for far more robust PDF extraction — see extractTransactionsFromText.
 */
import Papa from 'papaparse';
import { PDFParse } from 'pdf-parse';
import type { Category } from '@/types';
import { categorizeTransaction } from './spending-agent';
import { isLlmConfigured, extractTransactionsFromStatement } from './llm';

export interface ParsedTransaction {
  amount: number; // positive whole rupees, money spent
  description: string;
  merchant: string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  category: Category;
}

// ─── Shared helpers ────────────────────────────────────────────────────────

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/** Parse the many date formats banks use into an ISO YYYY-MM-DD string. */
export function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  // YYYY-MM-DD or YYYY/MM/DD
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return toIso(+m[1], +m[2], +m[3]);

  // DD-MM-YYYY or DD/MM/YYYY (assume day-first, common on Indian statements)
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (m) {
    const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return toIso(year, +m[2], +m[1]);
  }

  // DD MMM YYYY  (e.g. 05 Jul 2026 / 5-Jul-26)
  m = s.match(/^(\d{1,2})[-\s]([A-Za-z]{3})[A-Za-z]*[-\s](\d{2,4})/);
  if (m) {
    const mon = MONTHS[m[2].toLowerCase()];
    if (mon) {
      const year = m[3].length === 2 ? 2000 + +m[3] : +m[3];
      return toIso(year, mon, +m[1]);
    }
  }

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  return null;
}

function toIso(y: number, mo: number, d: number): string | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y.toString().padStart(4, '0')}-${mo.toString().padStart(2, '0')}-${d
    .toString()
    .padStart(2, '0')}`;
}

/** Strip currency symbols/commas and return a positive magnitude, or null. */
function parseAmount(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[₹$,\s]/g, '').replace(/[()]/g, '');
  const n = Number.parseFloat(cleaned);
  if (Number.isNaN(n)) return null;
  return Math.abs(Math.round(n));
}

function deriveMerchant(description: string): string {
  const clean = description.replace(/\s+/g, ' ').trim();
  // Bank narrations often look like "UPI/ZOMATO/..." or "POS 1234 SWIGGY".
  const parts = clean.split(/[/|]/).map((p) => p.trim()).filter(Boolean);
  const candidate = parts.find((p) => /[a-zA-Z]{3,}/.test(p) && !/^\d+$/.test(p)) ?? clean;
  return candidate.slice(0, 60) || 'Unknown';
}

function toParsed(
  amount: number,
  description: string,
  date: string,
  isRecurring = false
): ParsedTransaction {
  const merchant = deriveMerchant(description);
  return {
    amount,
    description: description.slice(0, 240) || merchant,
    merchant,
    date,
    isRecurring,
    category: categorizeTransaction(description, merchant),
  };
}

// ─── CSV ──────────────────────────────────────────────────────────────────

function findKey(headers: string[], candidates: string[]): string | null {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const cand of candidates) {
    const idx = lower.findIndex((h) => h === cand || h.includes(cand));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

export function parseCsvStatement(csvText: string): ParsedTransaction[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const rows = result.data;
  if (!rows.length) return [];

  const headers = Object.keys(rows[0]);
  const dateKey = findKey(headers, ['date', 'txn date', 'value date', 'transaction date']);
  const descKey = findKey(headers, ['description', 'narration', 'particulars', 'details', 'remarks', 'transaction']);
  const debitKey = findKey(headers, ['debit', 'withdrawal', 'withdrawal amt', 'dr', 'paid out']);
  const creditKey = findKey(headers, ['credit', 'deposit', 'deposit amt', 'cr', 'paid in']);
  const amountKey = findKey(headers, ['amount', 'amt']);

  const out: ParsedTransaction[] = [];
  for (const row of rows) {
    const date = dateKey ? normalizeDate(row[dateKey] ?? '') : null;
    if (!date) continue;

    const description = (descKey ? row[descKey] : '')?.trim() || 'Bank transaction';

    let amount: number | null = null;
    if (debitKey) {
      amount = parseAmount(row[debitKey] ?? '');
    }
    if (amount === null && amountKey) {
      // Single signed amount column: negative / debit-marked = spend.
      const raw = row[amountKey] ?? '';
      const signedNegative = /^-|\(/.test(raw.trim());
      const magnitude = parseAmount(raw);
      // If there's a credit column too, skip positives (they are income).
      if (magnitude !== null && (signedNegative || !creditKey)) amount = magnitude;
    }

    if (amount === null || amount <= 0) continue; // skip credits / zero rows
    out.push(toParsed(amount, description, date));
  }
  return out;
}

// ─── PDF ────────────────────────────────────────────────────────────────────

/** Extract raw text from a PDF buffer using pdf-parse. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text ?? '';
  } finally {
    await parser.destroy();
  }
}

/**
 * Heuristic structuring of statement text into transactions. Matches lines that
 * begin with a date and contain a trailing amount. This is the fallback used when
 * no LLM is configured; the LLM extractor (Step 4) replaces this for real PDFs.
 */
export function extractTransactionsFromText(text: string): ParsedTransaction[] {
  const out: ParsedTransaction[] = [];
  const lines = text.split(/\r?\n/);

  const lineRe =
    /^\s*(\d{1,2}[-/][A-Za-z0-9]{2,}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\s+(.*?)\s+([₹$]?\(?-?[\d,]+\.?\d{0,2}\)?)\s*$/;

  for (const line of lines) {
    const m = line.match(lineRe);
    if (!m) continue;
    const date = normalizeDate(m[1]);
    const amount = parseAmount(m[3]);
    if (!date || amount === null || amount <= 0) continue;
    out.push(toParsed(amount, m[2].trim(), date));
  }
  return out;
}

export async function parsePdfStatement(buffer: Buffer): Promise<ParsedTransaction[]> {
  const text = await extractPdfText(buffer);
  if (!text.trim()) return [];

  // Prefer the LLM extractor for PDFs — statement layouts vary too much for the
  // regex heuristic. Fall back to the heuristic if the LLM isn't configured or errors.
  if (isLlmConfigured()) {
    try {
      const rows = await extractTransactionsFromStatement(text);
      const mapped = rows
        .map((r) => {
          const date = normalizeDate(r.date);
          const amount = Math.abs(Math.round(r.amount));
          if (!date || !Number.isFinite(amount) || amount <= 0) return null;
          const description = (r.description || r.merchant || 'Bank transaction').slice(0, 240);
          const merchant = (r.merchant || deriveMerchant(description)).slice(0, 60);
          return {
            amount,
            description,
            merchant,
            date,
            isRecurring: Boolean(r.isRecurring),
            category: categorizeTransaction(description, merchant),
          } satisfies ParsedTransaction;
        })
        .filter((x): x is ParsedTransaction => x !== null);
      if (mapped.length > 0) return mapped;
    } catch (err) {
      console.error('[statement-parser] LLM extraction failed, using heuristic:', err);
    }
  }

  return extractTransactionsFromText(text);
}
