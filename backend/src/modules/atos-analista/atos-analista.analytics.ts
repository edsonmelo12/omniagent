import { AssetIntentRow, AnalyticalVerdictRow, PublishingAssetRow } from "./atos-analista.repository.js";

export type PortfolioBalance = {
  byObjective: Record<string, number>;
  byHorizon: Record<string, number>;
  byFunnelStage: Record<string, number>;
};

export type PatternStrength = {
  key: string;
  type: string;
  count: number;
  decisions: Record<string, number>;
  avgConfidence: "low" | "medium" | "high";
};

export const calculatePortfolioBalance = (intents: AssetIntentRow[]): PortfolioBalance => {
  const balance: PortfolioBalance = {
    byObjective: {},
    byHorizon: {},
    byFunnelStage: {},
  };

  intents.forEach((intent) => {
    balance.byObjective[intent.primary_objective] = (balance.byObjective[intent.primary_objective] || 0) + 1;
    balance.byHorizon[intent.return_horizon] = (balance.byHorizon[intent.return_horizon] || 0) + 1;
    balance.byFunnelStage[intent.funnel_stage] = (balance.byFunnelStage[intent.funnel_stage] || 0) + 1;
  });

  return balance;
};

export const detectPatterns = (
  assets: (PublishingAssetRow & { intent?: AssetIntentRow; verdict?: AnalyticalVerdictRow })[]
): PatternStrength[] => {
  const patterns: Record<string, PatternStrength> = {};

  assets.forEach((asset) => {
    if (!asset.intent) return;

    const keys = [
      { key: asset.intent.theme, type: "theme" },
      { key: asset.intent.angle, type: "angle" },
      { key: asset.format, type: "format" },
      { key: asset.intent.primary_objective, type: "objective" },
    ];

    keys.forEach(({ key, type }) => {
      const patternKey = `${type}:${key}`;
      if (!patterns[patternKey]) {
        patterns[patternKey] = {
          key,
          type,
          count: 0,
          decisions: {},
          avgConfidence: "low",
        };
      }

      const p = patterns[patternKey];
      p.count++;
      
      if (asset.verdict) {
        p.decisions[asset.verdict.decision] = (p.decisions[asset.verdict.decision] || 0) + 1;
      }
    });
  });

  return Object.values(patterns).sort((a, b) => b.count - a.count);
};

export const aggregateBusinessContribution = (summaries: any[]) => {
  const totals = {
    leads: 0,
    conversions: 0,
    opportunities: 0,
  };

  summaries.forEach((summary) => {
    const signals = summary.business_signals || {};
    totals.leads += signals.leads || 0;
    totals.conversions += signals.conversions || 0;
    totals.opportunities += signals.opportunities || 0;
  });

  return totals;
};
