import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type MonitoringReportRow = {
  id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

const getMetricsFromPayload = (payload: Record<string, unknown>) => payload.metrics ?? {};

const getNextPeriodEnd = () => new Date().toISOString().slice(0, 10);

export const listMonitoringReportsByClientId = async (clientId: string) =>
  query<MonitoringReportRow>(
    `select id, client_id, period_start, period_end, status, payload_json, created_at, updated_at
     from monitoring_reports
     where client_id = $1
     order by period_end desc`,
    [clientId],
  );

export const findLatestMonitoringReportByClientId = async (clientId: string) =>
  queryOne<MonitoringReportRow>(
    `select id, client_id, period_start, period_end, status, payload_json, created_at, updated_at
     from monitoring_reports
     where client_id = $1
     order by period_end desc
     limit 1`,
    [clientId],
  );

export const createMonitoringReportVersion = async (input: {
  clientId: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  payload: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    const result = await client.query<MonitoringReportRow>(
      `insert into monitoring_reports (client_id, period_start, period_end, status, payload_json)
       values ($1, $2, $3, $4, $5::jsonb)
       returning id, client_id, period_start, period_end, status, payload_json, created_at, updated_at`,
      [input.clientId, input.periodStart, input.periodEnd, input.status, JSON.stringify(input.payload)],
    );

    return result.rows[0];
  });

export const createMonitoringPayload = (input: {
  clientName: string;
  snapshot: {
    presence_score: number | null;
    consistency_score: number | null;
    proof_score: number | null;
    conversion_readiness: number | null;
    confidence: number;
    main_gaps_json: unknown;
    opportunity_notes_json: unknown;
  } | null;
  clientRecordVersion: number | null;
  proposalVersion: number | null;
  contentPlanVersion: number | null;
  scheduleVersion: number | null;
  contentRhythm: string | null;
  editorialPautas: Array<{
    id: string;
    title: string;
    pillar: string;
    angle: string;
    objective: string;
    reason: string;
    format: string;
    source: {
      clientRecordVersion: number;
      proposalVersion: number;
      marketResearchVersion: number | null;
    };
  }>;
  scheduleItems: Array<{
    position: number;
    date: string;
    channel: string;
    title: string;
    pillar: string;
    angle: string;
    objective: string;
    format: string;
    status: string;
  }>;
}) => {
  const metrics = {
    growth: {
      followerDelta: null,
      reach: null,
      impressions: null,
      profileVisits: null,
      clicks: null,
      saves: null,
      shares: null,
      videoCompletion: null,
      engagementRate: null,
    },
    signals: {
      highReachLowEngagement: false,
      lowReachHighEngagement: false,
      lowVideoCompletion: false,
      highCommentsLowClicks: false,
    },
  };

  const snapshot = input.snapshot;

  return {
    title: `${input.clientName} monitoring report`,
    clientRecordVersion: input.clientRecordVersion,
    proposalVersion: input.proposalVersion,
    contentPlanVersion: input.contentPlanVersion,
    scheduleVersion: input.scheduleVersion,
    contentRhythm: input.contentRhythm,
    editorialPautas: input.editorialPautas,
    scheduleItems: input.scheduleItems,
    scoreContext: snapshot
      ? {
          presence: snapshot.presence_score,
          consistency: snapshot.consistency_score,
          proof: snapshot.proof_score,
          conversionReadiness: snapshot.conversion_readiness,
          confidence: snapshot.confidence,
        }
      : null,
    mainGaps: snapshot?.main_gaps_json ?? [],
    opportunityNotes: snapshot?.opportunity_notes_json ?? [],
    metrics,
    signals: {
      interpretations: [
        "High reach with low engagement means distribution is working better than connection.",
        "Low reach with good engagement means content is strong and distribution needs support.",
        "Low video completion means the hook or pacing needs adjustment.",
        "Many comments and few clicks means the CTA needs more clarity.",
      ],
    },
    updatedAt: new Date().toISOString(),
  };
};

export const getFallbackPeriod = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 28);
  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: getNextPeriodEnd(),
  };
};
