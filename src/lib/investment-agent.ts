/**
 * Investment Agent — Core Logic (SHOULD tier)
 *
 * Responsibilities:
 *  - Portfolio analysis: total value, unrealized gains, asset allocation.
 *  - Risk profile scoring.
 *  - Tax-saving investment recommendations (Section 80C, NPS, ELSS).
 *
 * Consumed by the LangChain Orchestration Layer.
 */

import type { PortfolioSummary, AssetAllocation, Transaction } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Holding {
  name: string;
  type: 'EQUITY' | 'DEBT' | 'GOLD' | 'CASH';
  investedAmount: number;
  currentValue: number;
}

export interface InvestmentAnalysis {
  portfolio: PortfolioSummary;
  holdings: Holding[];
  riskScore: number; // 1-10
  riskLabel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  taxSavingHeadroom: TaxSavingOpportunity[];
  annualizedReturn: number; // percentage
}

export interface TaxSavingOpportunity {
  instrument: string;
  section: '80C' | '80CCD' | 'NPS';
  maxLimit: number;
  utilized: number;
  remaining: number;
  estimatedTaxSaving: number;
}

// ─── Holdings derived from the user's real transactions ──────────────────────

/**
 * Illustrative appreciation applied to invested amounts to estimate current
 * market value. Real brokerage/NAV sync is a future (COULD-tier) integration;
 * until then these deterministic, per-asset-class factors give a representative
 * portfolio view. The UI labels these values as estimated.
 */
const GROWTH_FACTOR: Record<Holding['type'], number> = {
  EQUITY: 1.14,
  DEBT: 1.07,
  GOLD: 1.15,
  CASH: 1.0,
};

/** Classify an investment instrument into an asset class from its name/merchant. */
function classifyHolding(text: string): Holding['type'] {
  const t = text.toLowerCase();
  if (/gold|sgb|sovereign/.test(t)) return 'GOLD';
  if (/ppf|nps|debt|bond|\bfd\b|fixed deposit|liquid|gilt|treasury/.test(t)) return 'DEBT';
  if (/savings|balance|wallet/.test(t)) return 'CASH';
  // ELSS, bluechip, index, large/mid/small cap, mutual fund, SIP, stocks → equity.
  return 'EQUITY';
}

/**
 * Build holdings from the user's INVESTMENTS-category transactions.
 * Each distinct merchant/instrument becomes one holding; the invested amount is
 * the sum of that instrument's contributions, and current value is estimated via
 * a deterministic per-asset-class appreciation factor.
 */
export function deriveHoldingsFromTransactions(transactions: Transaction[]): Holding[] {
  const investmentTxns = transactions.filter((t) => t.category === 'INVESTMENTS');
  if (investmentTxns.length === 0) return [];

  const byInstrument = new Map<string, { name: string; type: Holding['type']; invested: number }>();
  for (const tx of investmentTxns) {
    const name = (tx.merchant || tx.description || 'Investment').trim();
    const key = name.toLowerCase();
    const type = classifyHolding(`${tx.description} ${tx.merchant}`);
    const existing = byInstrument.get(key);
    if (existing) {
      existing.invested += tx.amount;
    } else {
      byInstrument.set(key, { name, type, invested: tx.amount });
    }
  }

  return Array.from(byInstrument.values()).map(({ name, type, invested }) => ({
    name,
    type,
    investedAmount: invested,
    currentValue: Math.round(invested * GROWTH_FACTOR[type]),
  }));
}

// ─── Analysis Functions ──────────────────────────────────────────────────────

function computeAllocation(holdings: Holding[]): AssetAllocation {
  const total = holdings.reduce((s, h) => s + h.currentValue, 0);
  if (total === 0) return { equityPercentage: 0, debtPercentage: 0, goldPercentage: 0, cashPercentage: 0 };

  const sum = (type: Holding['type']) =>
    holdings.filter((h) => h.type === type).reduce((s, h) => s + h.currentValue, 0);

  return {
    equityPercentage: Math.round((sum('EQUITY') / total) * 100),
    debtPercentage: Math.round((sum('DEBT') / total) * 100),
    goldPercentage: Math.round((sum('GOLD') / total) * 100),
    cashPercentage: Math.round((sum('CASH') / total) * 100),
  };
}

function computeRiskScore(allocation: AssetAllocation): { score: number; label: InvestmentAnalysis['riskLabel'] } {
  const score = Math.round(allocation.equityPercentage / 10);
  const label: InvestmentAnalysis['riskLabel'] =
    score >= 7 ? 'AGGRESSIVE' : score >= 4 ? 'MODERATE' : 'CONSERVATIVE';
  return { score, label };
}

function computeTaxSavingOpportunities(holdings: Holding[]): TaxSavingOpportunity[] {
  // Treat equity (ELSS-style) and debt (PPF/NSC-style) contributions as
  // 80C-eligible; gold and cash balances are not. Capped at the ₹1.5L limit.
  const sec80C_limit = 150000;
  const sec80C_eligible = holdings
    .filter((h) => h.type === 'EQUITY' || h.type === 'DEBT')
    .reduce((s, h) => s + h.investedAmount, 0);
  const sec80C_utilized = Math.min(sec80C_limit, sec80C_eligible);
  const sec80C_remaining = Math.max(0, sec80C_limit - sec80C_utilized);

  return [
    {
      instrument: 'ELSS Mutual Funds / PPF / NSC',
      section: '80C',
      maxLimit: sec80C_limit,
      utilized: sec80C_utilized,
      remaining: sec80C_remaining,
      estimatedTaxSaving: Math.round(sec80C_remaining * 0.312), // 31.2% tax bracket
    },
    {
      instrument: 'NPS Tier I Additional Contribution',
      section: '80CCD',
      maxLimit: 50000,
      utilized: 0,
      remaining: 50000,
      estimatedTaxSaving: Math.round(50000 * 0.312),
    },
  ];
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Analyze a set of holdings into a full InvestmentAnalysis.
 * Callers pass holdings derived from the user's real investment transactions.
 */
export function analyzeInvestments(holdings: Holding[]): InvestmentAnalysis {

  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalInvested = holdings.reduce((s, h) => s + h.investedAmount, 0);
  const unrealizedGains = totalValue - totalInvested;
  const annualizedReturn = parseFloat(((unrealizedGains / totalInvested) * 100).toFixed(1));

  const allocation = computeAllocation(holdings);
  const { score: riskScore, label: riskLabel } = computeRiskScore(allocation);
  const taxSavingHeadroom = computeTaxSavingOpportunities(holdings);

  const portfolio: PortfolioSummary = {
    totalValue,
    unrealizedGains,
    allocation,
    recommendedTaxSavingInvestments: taxSavingHeadroom.reduce((s, t) => s + t.remaining, 0),
  };

  return { portfolio, holdings, riskScore, riskLabel, taxSavingHeadroom, annualizedReturn };
}

/**
 * Analyze the signed-in user's portfolio from their real transactions.
 * Returns null when the user has no investment transactions yet, so callers can
 * render an empty state instead of fabricated demo numbers.
 */
export function analyzeInvestmentsForUser(transactions: Transaction[]): InvestmentAnalysis | null {
  const holdings = deriveHoldingsFromTransactions(transactions);
  if (holdings.length === 0) return null;
  return analyzeInvestments(holdings);
}
