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

import type { PortfolioSummary, AssetAllocation } from '@/types';

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

// ─── Seed Portfolio Data ─────────────────────────────────────────────────────

function getSeedHoldings(): Holding[] {
  return [
    { name: 'Axis Bluechip Fund (ELSS)', type: 'EQUITY', investedAmount: 60000, currentValue: 71400 },
    { name: 'Mirae Asset Large Cap Fund', type: 'EQUITY', investedAmount: 48000, currentValue: 55200 },
    { name: 'ICICI Pru Short Term Debt Fund', type: 'DEBT', investedAmount: 30000, currentValue: 32100 },
    { name: 'Sovereign Gold Bond 2024', type: 'GOLD', investedAmount: 15000, currentValue: 17250 },
    { name: 'PPF Account', type: 'DEBT', investedAmount: 50000, currentValue: 53500 },
    { name: 'Savings Account Balance', type: 'CASH', investedAmount: 20000, currentValue: 20000 },
  ];
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
  const elssInvested = holdings
    .filter((h) => h.name.toLowerCase().includes('elss'))
    .reduce((s, h) => s + h.investedAmount, 0);
  const ppfInvested = holdings
    .filter((h) => h.name.toLowerCase().includes('ppf'))
    .reduce((s, h) => s + h.investedAmount, 0);

  const sec80C_limit = 150000;
  const sec80C_utilized = elssInvested + ppfInvested;
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

export function analyzeInvestments(): InvestmentAnalysis {
  const holdings = getSeedHoldings();

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
