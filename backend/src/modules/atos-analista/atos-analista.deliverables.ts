import { 
  findPublishingAssetById, 
  findAssetIntentByAssetId, 
  listVerdictsByTarget,
  listPublishingAssetsByClientId,
  findAssetIntentsByAssetIds,
  findLatestVerdictsByTargetIds,
  listAssetIntentsByClientId
} from "./atos-analista.repository.js";
import { getAssetEvidenceSummary, calculateConfidence } from "./atos-analista.service.js";
import { calculatePortfolioBalance, detectPatterns, aggregateBusinessContribution } from "./atos-analista.analytics.js";

export const buildAssetCard = async (input: { userId: string; agencyId: string; clientId: string; assetId: string }) => {
  const asset = await findPublishingAssetById(input.assetId);
  if (!asset || asset.client_id !== input.clientId) return null;

  const intent = await findAssetIntentByAssetId(input.assetId);
  const evidence = await getAssetEvidenceSummary(input);
  const verdicts = await listVerdictsByTarget("asset", input.assetId);
  
  const latestVerdict = verdicts[0] || null;
  const confidence = calculateConfidence(evidence as any);

  return {
    asset,
    intent,
    evidence: evidence?.summaries || [],
    verdicts,
    analysis: {
      decision: latestVerdict?.decision || "inconclusive",
      confidence: latestVerdict?.confidence || confidence,
      probableCausality: latestVerdict?.probable_causality || null,
      nextAction: latestVerdict?.next_action || null,
    }
  };
};

export const buildWeeklyOperationalReview = async (input: { userId: string; agencyId: string; clientId: string }) => {
  const assets = await listPublishingAssetsByClientId(input.clientId);
  const assetIds = assets.map(a => a.id);
  
  const intents = await findAssetIntentsByAssetIds(assetIds);
  const verdicts = await findLatestVerdictsByTargetIds("asset", assetIds);

  const enrichedAssets = assets.map(asset => ({
    ...asset,
    intent: intents.find(i => i.asset_id === asset.id),
    verdict: verdicts.find(v => v.target_id === asset.id),
  }));

  const patterns = detectPatterns(enrichedAssets as any);
  const balance = calculatePortfolioBalance(intents);

  return {
    clientId: input.clientId,
    period: "Last 7 Days", // Placeholder for actual window logic
    totalAssets: assets.length,
    balance,
    patterns: patterns.slice(0, 5), // Top 5 patterns
    highImpactAssets: enrichedAssets.filter(a => a.verdict?.decision === "scale"),
    warningAssets: enrichedAssets.filter(a => a.verdict?.decision === "archive"),
  };
};

export const buildMonthlyPortfolioMemo = async (input: { userId: string; agencyId: string; clientId: string }) => {
  const intents = await listAssetIntentsByClientId(input.clientId);
  const balance = calculatePortfolioBalance(intents);
  
  // This would aggregate evidence across the month in a real implementation
  return {
    clientId: input.clientId,
    month: new Date().toISOString().slice(0, 7),
    portfolioBalance: balance,
    strategicInsights: [
      "Thesis A is strengthening based on pattern consistency.",
      "Portfolio is leaning too much into short-term horizons."
    ],
    recommendations: [
      "Rebalance distribution towards Long-Term Authority assets.",
      "Scale successful Angle X in Channel Y."
    ]
  };
};
