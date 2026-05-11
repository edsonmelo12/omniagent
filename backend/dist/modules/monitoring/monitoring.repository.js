import { query, queryOne, withTransaction } from "../../shared/db/database.js";
const getMetricsFromPayload = (payload) => payload.metrics ?? {};
const getNextPeriodEnd = () => new Date().toISOString().slice(0, 10);
export const listMonitoringReportsByClientId = async (clientId) => query(`select id, client_id, period_start, period_end, status, payload_json, created_at, updated_at
     from monitoring_reports
     where client_id = $1
     order by period_end desc`, [clientId]);
export const findLatestMonitoringReportByClientId = async (clientId) => queryOne(`select id, client_id, period_start, period_end, status, payload_json, created_at, updated_at
     from monitoring_reports
     where client_id = $1
     order by period_end desc
     limit 1`, [clientId]);
export const createMonitoringReportVersion = async (input) => withTransaction(async (client) => {
    const result = await client.query(`insert into monitoring_reports (client_id, period_start, period_end, status, payload_json)
       values ($1, $2, $3, $4, $5::jsonb)
       returning id, client_id, period_start, period_end, status, payload_json, created_at, updated_at`, [input.clientId, input.periodStart, input.periodEnd, input.status, JSON.stringify(input.payload)]);
    return result.rows[0];
});
export const createMonitoringPayload = (input) => {
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
