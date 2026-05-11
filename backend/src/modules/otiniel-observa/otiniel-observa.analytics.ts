import type {
  NormalizedObservationRecordRow,
  ObservationProfileRow,
  ObservationRunRow,
  ObservationSummaryRow,
  QualitativeEvidenceRow,
} from "./otiniel-observa.repository.js";

export type ObservationWindowType = "asset" | "weekly" | "monthly";

export type ObservationSummaryDraft = {
  assetId: string | null;
  windowType: ObservationWindowType;
  periodStart: string;
  periodEnd: string;
  socialSignals: Record<string, unknown>;
  siteSignals: Record<string, unknown>;
  businessSignals: Record<string, unknown>;
  qualitativeSignals: Record<string, unknown>;
  observationProfileIds: string[];
  sourceCount: number;
  evidenceLevel: string;
  completenessStatus: string;
  notes: string | null;
};

export type ObservationCoverageGap = {
  code: string;
  severity: "low" | "medium" | "high";
  message: string;
  domain?: string;
  profileIds?: string[];
};

export type ObservationCoverageSnapshot = {
  connectedSources: number;
  missingSources: number;
  profileStatusDistribution: Record<string, number>;
  domainCoverage: {
    social: DomainCoverage;
    site: DomainCoverage;
    business: DomainCoverage;
    qualitative: DomainCoverage;
  };
  highRiskGaps: ObservationCoverageGap[];
};

type DomainCoverage = {
  profileCount: number;
  activeProfileCount: number;
  evidenceCount: number;
  summaryCount: number;
  completenessStatus: string;
  evidenceLevel: string;
};

const evidenceRank: Record<string, number> = {
  derived: 1,
  public_only: 2,
  manual_confirmed: 3,
  authorized_export: 4,
  direct_api: 5,
};

const completenessRank: Record<string, number> = {
  missing: 1,
  minimal: 2,
  partial: 3,
  complete: 4,
};

const rankToCompleteness = (score: number, evidenceCount: number) => {
  if (evidenceCount === 0) {
    return "missing";
  }

  if (score >= 4) {
    return "complete";
  }

  if (score >= 3) {
    return "partial";
  }

  return "minimal";
};

const channelToDomain = (channel: string) => {
  const channelName = channel.trim().toLowerCase();

  if (channelName.includes("site") || channelName.includes("web") || channelName.includes("analytics")) {
    return "site";
  }

  if (channelName.includes("crm") || channelName.includes("business")) {
    return "business";
  }

  if (channelName.includes("manual") || channelName.includes("qual")) {
    return "qualitative";
  }

  return "social";
};

const unique = <T,>(values: T[]) => [...new Set(values)];

const signalRecordCount = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return 0;
  }

  const maybeRecord = value as Record<string, unknown>;
  const rawCount = maybeRecord.recordCount;
  return typeof rawCount === "number" ? rawCount : 0;
};

const collectProfileIds = (
  normalizedRecords: NormalizedObservationRecordRow[],
  qualitativeEvidence: QualitativeEvidenceRow[],
) =>
  unique([
    ...normalizedRecords.map((record) => record.observation_profile_id).filter((value): value is string => Boolean(value)),
    ...qualitativeEvidence.map((evidence) => evidence.observation_profile_id).filter((value): value is string => Boolean(value)),
  ]);

const summarizeSignals = (
  windowType: ObservationWindowType,
  periodStart: string,
  periodEnd: string,
  assetId: string | null,
  normalizedRecords: NormalizedObservationRecordRow[],
  qualitativeEvidence: QualitativeEvidenceRow[],
): ObservationSummaryDraft => {
  const metricNames = unique(normalizedRecords.map((record) => record.metric_name));
  const sourceRefs = unique(normalizedRecords.map((record) => record.raw_source_id));
  const qualitativeSourceRefs = unique(qualitativeEvidence.map((evidence) => evidence.source_ref).filter((value): value is string => Boolean(value)));
  const socialRecords = normalizedRecords.filter((record) => channelToDomain(record.channel) === "social");
  const siteRecords = normalizedRecords.filter((record) => channelToDomain(record.channel) === "site");
  const businessRecords = normalizedRecords.filter((record) => channelToDomain(record.channel) === "business");
  const qualitativeRecords = qualitativeEvidence;
  const strongestEvidenceLevel = unique([
    ...normalizedRecords.map((record) => record.evidence_level),
    ...qualitativeEvidence.map((record) => record.evidence_level),
  ]).reduce((best, current) => {
    const bestRank = evidenceRank[best] ?? 0;
    const currentRank = evidenceRank[current] ?? 0;
    return currentRank > bestRank ? current : best;
  }, "derived");

  const completenessScore = normalizedRecords.reduce((score, record) => {
    const recordRank = completenessRank[record.completeness_status] ?? 0;
    return Math.max(score, recordRank);
  }, 0);

  const hasSocial = socialRecords.length > 0;
  const hasSite = siteRecords.length > 0;
  const hasBusiness = businessRecords.length > 0;
  const hasQualitative = qualitativeRecords.length > 0;

  const fallbackCompleteness = completenessScore || (hasSocial ? 3 : 0) || (hasSite ? 3 : 0) || (hasBusiness ? 3 : 0) || (hasQualitative ? 2 : 0);
  const completenessStatus = rankToCompleteness(Math.min(fallbackCompleteness, 4), normalizedRecords.length + qualitativeRecords.length);

  const socialSignals = {
    recordCount: socialRecords.length,
    sourceCount: unique(socialRecords.map((record) => record.raw_source_id)).length,
    metricCount: socialRecords.length,
    metricNames: unique(socialRecords.map((record) => record.metric_name)),
  };

  const siteSignals = {
    recordCount: siteRecords.length,
    sourceCount: unique(siteRecords.map((record) => record.raw_source_id)).length,
    metricCount: siteRecords.length,
    metricNames: unique(siteRecords.map((record) => record.metric_name)),
  };

  const businessSignals = {
    recordCount: businessRecords.length,
    sourceCount: unique(businessRecords.map((record) => record.raw_source_id)).length,
    metricCount: businessRecords.length,
    metricNames: unique(businessRecords.map((record) => record.metric_name)),
  };

  const qualitativeSignals = {
    recordCount: qualitativeRecords.length,
    signalTypes: unique(qualitativeRecords.map((record) => record.signal_type)),
  };

  const notes = [
    `window=${windowType}`,
    `period=${periodStart}..${periodEnd}`,
    `sources=${sourceRefs.length || qualitativeSourceRefs.length}`,
    `metrics=${metricNames.length}`,
    `qualitative=${qualitativeRecords.length}`,
    `evidence=${strongestEvidenceLevel}`,
    `completeness=${completenessStatus}`,
  ].join("; ");

  return {
    assetId,
    windowType,
    periodStart,
    periodEnd,
    socialSignals,
    siteSignals,
    businessSignals,
    qualitativeSignals,
    observationProfileIds: collectProfileIds(normalizedRecords, qualitativeEvidence),
    sourceCount: sourceRefs.length || qualitativeSourceRefs.length,
    evidenceLevel: strongestEvidenceLevel,
    completenessStatus,
    notes,
  };
};

export const buildObservationSummaryDrafts = (input: {
  windowType: ObservationWindowType;
  periodStart: string;
  periodEnd: string;
  assetId?: string | null;
  normalizedRecords: NormalizedObservationRecordRow[];
  qualitativeEvidence: QualitativeEvidenceRow[];
}) => {
  if (input.windowType === "asset") {
    const assetIds = input.assetId !== undefined ? [input.assetId] : unique(input.normalizedRecords.map((record) => record.asset_id).filter((value): value is string => Boolean(value)));
    const targets = assetIds.length > 0 ? assetIds : [null];

    return targets.map((targetAssetId) => {
      const filteredNormalized = input.normalizedRecords.filter((record) => record.asset_id === targetAssetId);
      const filteredQualitative = input.qualitativeEvidence.filter((record) => record.asset_id === targetAssetId);
      return summarizeSignals(input.windowType, input.periodStart, input.periodEnd, targetAssetId, filteredNormalized, filteredQualitative);
    });
  }

  const normalizedRecords =
    input.assetId === undefined
      ? input.normalizedRecords
      : input.normalizedRecords.filter((record) => record.asset_id === input.assetId);
  const qualitativeEvidence =
    input.assetId === undefined
      ? input.qualitativeEvidence
      : input.qualitativeEvidence.filter((record) => record.asset_id === input.assetId);

  return [summarizeSignals(input.windowType, input.periodStart, input.periodEnd, input.assetId ?? null, normalizedRecords, qualitativeEvidence)];
};

const domainMetrics = (
  domain: "social" | "site" | "business" | "qualitative",
  profiles: ObservationProfileRow[],
  normalizedRecords: NormalizedObservationRecordRow[],
  qualitativeEvidence: QualitativeEvidenceRow[],
  summaries: ObservationSummaryRow[],
) => {
  const domainProfiles = profiles.filter((profile) => channelToDomain(profile.channel) === domain);
  const domainActiveProfiles = domainProfiles.filter((profile) => profile.status === "active");
  const domainNormalizedRecords = domain === "qualitative" ? [] : normalizedRecords.filter((record) => channelToDomain(record.channel) === domain);
  const domainQualitativeEvidence = domain === "qualitative" ? qualitativeEvidence : [];
  const domainEvidenceCount = domain === "qualitative" ? qualitativeEvidence.length : domainNormalizedRecords.length;

  const domainSummaries = summaries.filter((summary) => {
    if (domain === "qualitative") {
      return signalRecordCount(summary.qualitative_signals) > 0;
    }

    if (domain === "social") {
      return signalRecordCount(summary.social_signals) > 0;
    }

    if (domain === "site") {
      return signalRecordCount(summary.site_signals) > 0;
    }

    return signalRecordCount(summary.business_signals) > 0;
  });

  const evidencePool =
    domain === "qualitative"
      ? domainQualitativeEvidence
      : domainNormalizedRecords;
  const evidenceLevel = evidencePool.reduce((best, record) => {
    const currentLevel = record.evidence_level;
    const currentRank = evidenceRank[currentLevel] ?? 0;
    const bestRank = evidenceRank[best] ?? 0;
    return currentRank > bestRank ? currentLevel : best;
  }, "derived");

  const completenessStatus = domainEvidenceCount === 0 ? "missing" : domainActiveProfiles.length > 0 ? "partial" : "minimal";

  return {
    profileCount: domainProfiles.length,
    activeProfileCount: domainActiveProfiles.length,
    evidenceCount: domainEvidenceCount,
    summaryCount: domainSummaries.length,
    completenessStatus,
    evidenceLevel,
  };
};

export const buildObservationCoverageSnapshot = (input: {
  profiles: ObservationProfileRow[];
  runs: ObservationRunRow[];
  summaries: ObservationSummaryRow[];
  normalizedRecords: NormalizedObservationRecordRow[];
  qualitativeEvidence: QualitativeEvidenceRow[];
}): ObservationCoverageSnapshot => {
  const connectedSources = input.profiles.filter((profile) => profile.status === "active").length;
  const missingSources = input.profiles.filter((profile) => profile.status !== "active").length;
  const profileStatusDistribution = input.profiles.reduce<Record<string, number>>((acc, profile) => {
    acc[profile.status] = (acc[profile.status] ?? 0) + 1;
    return acc;
  }, {});

  const domainCoverage = {
    social: domainMetrics("social", input.profiles, input.normalizedRecords, input.qualitativeEvidence, input.summaries),
    site: domainMetrics("site", input.profiles, input.normalizedRecords, input.qualitativeEvidence, input.summaries),
    business: domainMetrics("business", input.profiles, input.normalizedRecords, input.qualitativeEvidence, input.summaries),
    qualitative: domainMetrics("qualitative", input.profiles, input.normalizedRecords, input.qualitativeEvidence, input.summaries),
  };

  const highRiskGaps: ObservationCoverageGap[] = [];

  if (connectedSources === 0) {
    highRiskGaps.push({
      code: "NO_ACTIVE_PROFILES",
      severity: "high",
      message: "Nenhum profile ativo está conectado para este cliente.",
    });
  }

  for (const [domain, coverage] of Object.entries(domainCoverage) as Array<[keyof typeof domainCoverage, DomainCoverage]>) {
    if (coverage.activeProfileCount === 0) {
      highRiskGaps.push({
        code: `DOMAIN_MISSING_${domain.toUpperCase()}`,
        severity: coverage.profileCount === 0 ? "high" : "medium",
        domain,
        message: `O domínio ${domain} não tem conexão ativa.`,
      });
    }

    if (coverage.evidenceCount === 0) {
      highRiskGaps.push({
        code: `DOMAIN_NO_EVIDENCE_${domain.toUpperCase()}`,
        severity: "medium",
        domain,
        message: `O domínio ${domain} ainda não tem evidência normalizada.`,
      });
    }
  }

  if (input.runs.some((run) => run.run_status === "failed")) {
    highRiskGaps.push({
      code: "FAILED_RUNS_PRESENT",
      severity: "medium",
      message: "Existem collection runs com falha visível no histórico.",
    });
  }

  if (input.summaries.length === 0) {
    highRiskGaps.push({
      code: "NO_SUMMARIES",
      severity: "high",
      message: "Ainda não existem summaries para o cliente.",
    });
  }

  return {
    connectedSources,
    missingSources,
    profileStatusDistribution,
    domainCoverage,
    highRiskGaps,
  };
};
