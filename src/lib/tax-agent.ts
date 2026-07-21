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

import type { TaxEstimation, TaxDeduction } from '@/types';

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

interface TaxInput {
  annualGrossIncome: number;
  hraReceived: number;
  rentPaid: number;
  sec80C_invested: number;   // ELSS + PPF + etc.
  sec80D_premium: number;    // Health insurance
  sec80CCD_nps: number;      // NPS additional
}

function getSeedTaxInput(): TaxInput {
  return {
    annualGrossIncome: 85000 * 12,  // ₹10.2L annual
    hraReceived: 20000 * 12,        // ₹2.4L HRA component
    rentPaid: 25000 * 12,           // ₹3L rent paid
    sec80C_invested: 110000,        // Already invested (ELSS + PPF)
    sec80D_premium: 18000,          // Health insurance premium
    sec80CCD_nps: 0,                // No NPS yet
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

export function estimateTax(): TaxEstimation {
  const input = getSeedTaxInput();
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
