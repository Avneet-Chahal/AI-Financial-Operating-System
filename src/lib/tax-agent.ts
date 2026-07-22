/**
 * Tax Agent — Core Logic (SHOULD tier)
 *
 * Responsibilities:
 *  - Tax liability estimation under both Old and New regimes.
 *  - Per-section deduction tracking (80C, 80D, HRA, STANDARD).
 *  - Regime recommendation based on net tax liability.
 *
 * Consumed by the LangChain Orchestration Layer.
 */

import type { TaxEstimation, TaxDeduction, Transaction, UserProfile } from '@/types';

// ─── Tax Slabs ───────────────────────────────────────────────────────────────

function calcOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 250000) return 0;
  if (taxableIncome <= 500000) return Math.round((taxableIncome - 250000) * 0.05);
  if (taxableIncome <= 1000000) return 12500 + Math.round((taxableIncome - 500000) * 0.2);
  return 112500 + Math.round((taxableIncome - 1000000) * 0.3);
}

function calcNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 300000) return 0;
  if (taxableIncome <= 600000) return Math.round((taxableIncome - 300000) * 0.05);
  if (taxableIncome <= 900000) return 15000 + Math.round((taxableIncome - 600000) * 0.1);
  if (taxableIncome <= 1200000) return 45000 + Math.round((taxableIncome - 900000) * 0.15);
  if (taxableIncome <= 1500000) return 90000 + Math.round((taxableIncome - 1200000) * 0.2);
  return 150000 + Math.round((taxableIncome - 1500000) * 0.3);
}

// ─── Seed Input ──────────────────────────────────────────────────────────────

export interface TaxInput {
  annualGrossIncome: number;
  hraReceived: number;
  rentPaid: number;
  sec80C_invested: number;   // ELSS + PPF + etc.
  sec80D_premium: number;    // Health insurance
  sec80CCD_nps: number;      // NPS additional
}

/**
 * A zero input — used when the user has not provided an income yet. It produces
 * a zero tax estimate rather than fabricating demo figures, so the Tax page can
 * render an explicit "set your income" empty state instead.
 */
const EMPTY_TAX_INPUT: TaxInput = {
  annualGrossIncome: 0,
  hraReceived: 0,
  rentPaid: 0,
  sec80C_invested: 0,
  sec80D_premium: 0,
  sec80CCD_nps: 0,
};

/**
 * Derive tax inputs from the user's real profile + transactions.
 *
 * - Annual gross income comes from the profile's monthly income.
 * - Housing spend (rent) and 80C investment amounts are inferred from the user's
 *   own transactions: recurring rows are annualized (×12), one-offs counted once.
 * - HRA / 80D use conservative estimates derived from income (no dedicated inputs
 *   exist yet); these are transparent approximations, not authoritative filings.
 */
export function deriveTaxInput(
  profile: UserProfile | null,
  transactions: Transaction[]
): TaxInput {
  if (!profile || profile.monthlyIncome <= 0) return EMPTY_TAX_INPUT;

  const annualGrossIncome = profile.monthlyIncome * 12;

  const annualize = (txs: Transaction[]) =>
    txs.reduce((sum, tx) => sum + (tx.isRecurring ? tx.amount * 12 : tx.amount), 0);

  const rentPaid = annualize(transactions.filter((t) => t.category === 'HOUSING'));
  const sec80C_invested = Math.min(
    150000,
    annualize(transactions.filter((t) => t.category === 'INVESTMENTS'))
  );

  return {
    annualGrossIncome,
    hraReceived: Math.round(annualGrossIncome * 0.24), // ~24% HRA component assumption
    rentPaid,
    sec80C_invested,
    sec80D_premium: 18000,
    sec80CCD_nps: 0,
  };
}

// ─── Deduction Calculation ───────────────────────────────────────────────────

function computeDeductions(input: TaxInput): TaxDeduction[] {
  const {
    hraReceived, rentPaid, annualGrossIncome,
    sec80C_invested, sec80D_premium, sec80CCD_nps
  } = input;

  // HRA Exemption: min of (HRA received, Rent - 10% salary, 40% of basic)
  const basicSalary = annualGrossIncome * 0.4;
  const hraExempt = Math.min(hraReceived, rentPaid - basicSalary * 0.1, basicSalary * 0.4);
  const hraActual = Math.max(0, Math.round(hraExempt));

  return [
    {
      section: 'STANDARD',
      limit: 50000,
      utilized: 50000,
      remaining: 0,
    },
    {
      section: 'HRA',
      limit: hraReceived,
      utilized: hraActual,
      remaining: Math.max(0, hraReceived - hraActual),
    },
    {
      section: '80C',
      limit: 150000,
      utilized: Math.min(sec80C_invested, 150000),
      remaining: Math.max(0, 150000 - sec80C_invested),
    },
    {
      section: '80D',
      limit: 25000,
      utilized: Math.min(sec80D_premium, 25000),
      remaining: Math.max(0, 25000 - sec80D_premium),
    },
    {
      section: '80CCD',
      limit: 50000,
      utilized: Math.min(sec80CCD_nps, 50000),
      remaining: Math.max(0, 50000 - sec80CCD_nps),
    },
  ];
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function estimateTax(input: TaxInput = EMPTY_TAX_INPUT): TaxEstimation {
  const deductions = computeDeductions(input);

  // Old regime: apply all deductions
  const totalOldDeductions = deductions.reduce((s, d) => s + d.utilized, 0);
  const taxableOld = Math.max(0, input.annualGrossIncome - totalOldDeductions);
  const taxOld = calcOldRegimeTax(taxableOld);

  // New regime: only standard deduction (₹75,000 from FY26 budget)
  const taxableNew = Math.max(0, input.annualGrossIncome - 75000);
  const taxNew = calcNewRegimeTax(taxableNew);

  return {
    taxableIncome: taxableOld,
    estimatedTaxOldRegime: taxOld,
    estimatedTaxNewRegime: taxNew,
    recommendedRegime: taxOld <= taxNew ? 'OLD' : 'NEW',
    deductions,
  };
}
