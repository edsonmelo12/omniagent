import { isDatabaseConfigured, query, queryOne } from "../../shared/db/database.js";

export type ProductEventRow = {
  id: number;
  agency_id: string | null;
  user_id: string;
  client_id: string | null;
  event_name: string;
  source: string | null;
  properties_json: unknown;
  created_at: string;
};
export type OfferEventRow = ProductEventRow;

export type ProductEventAggregate = {
  totalEvents: number;
  counts: Record<string, number>;
  lastEvent: {
    eventName: string;
    clientId: string | null;
    source: string | null;
    timestamp: string;
  } | null;
};
export type OfferEventAggregate = ProductEventAggregate;

export type ProductEventTopClient = {
  clientId: string | null;
  clientName: string | null;
  eventCount: number;
  lastEventAt: string | null;
};
export type OfferEventTopClient = ProductEventTopClient;

export type ProductEventFunnelStage = {
  key: "discovery" | "activation" | "adoption" | "retention" | "reactivation";
  label: string;
};
export type OfferEventFunnelStage = ProductEventFunnelStage;

export type ProductEventExecutiveSummary = {
  trend: string;
  signal: string;
  action: string;
  tone: "neutral" | "positive" | "warning";
};
export type OfferEventExecutiveSummary = ProductEventExecutiveSummary;

export type ProductEventExecutiveShiftRate = {
  shiftCount: number;
  snapshotCount: number;
  ratePercent: number | null;
};
export type OfferEventExecutiveShiftRate = ProductEventExecutiveShiftRate;

export type ProductEventExecutiveSnapshot = ProductEventExecutiveSummary & {
  funnelStageKey: ProductEventFunnelStage["key"];
  funnelStageLabel: string;
  totalEvents: number;
  previousTotalEvents: number;
  totalEventsDelta: number;
  totalEventsPercent: number | null;
  createdAt: string;
};
export type OfferEventExecutiveSnapshot = ProductEventExecutiveSnapshot;

export type ProductEventMetrics = {
  scope: {
    agencyId: string | null;
    clientId: string | null;
  };
  windowDays: number;
  funnelStage: ProductEventFunnelStage;
  executiveSummary: ProductEventExecutiveSummary;
  shiftRate: ProductEventExecutiveShiftRate;
  summaryHistory: ProductEventExecutiveSnapshot[];
  currentPeriod: {
    start: string;
    end: string;
    aggregate: ProductEventAggregate;
  };
  previousPeriod: {
    start: string;
    end: string;
    aggregate: ProductEventAggregate;
  };
  change: {
    totalEventsDelta: number;
    totalEventsPercent: number | null;
  };
  topClients: ProductEventTopClient[];
};
export type OfferEventMetrics = ProductEventMetrics;

type ProductEventInput = {
  agencyId: string | null;
  userId: string;
  clientId?: string | null;
  eventName: string;
  source?: string | null;
  properties?: Record<string, unknown>;
};
export type OfferEventInput = ProductEventInput;

const EVENT_TABLE = "product_events";
const SNAPSHOT_TABLE = "product_event_executive_snapshots";

let ensureTablePromise: Promise<void> | null = null;

const defaultAggregate = (): ProductEventAggregate => ({
  totalEvents: 0,
  counts: {},
  lastEvent: null,
});

const defaultMetrics = (scope: ProductEventMetrics["scope"], windowDays: number): ProductEventMetrics => ({
  scope,
  windowDays,
  funnelStage: buildFunnelStage(defaultAggregate()),
  executiveSummary: buildExecutiveSummary({
    scope,
    current: defaultAggregate(),
    previous: defaultAggregate(),
    change: {
      totalEventsDelta: 0,
      totalEventsPercent: null,
    },
    topClients: [],
  }),
  shiftRate: {
    shiftCount: 0,
    snapshotCount: 0,
    ratePercent: null,
  },
  summaryHistory: [],
  currentPeriod: {
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    aggregate: defaultAggregate(),
  },
  previousPeriod: {
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    aggregate: defaultAggregate(),
  },
  change: {
    totalEventsDelta: 0,
    totalEventsPercent: null,
  },
  topClients: [],
});

const ensureProductEventsTable = async () => {
  if (!isDatabaseConfigured()) return;

  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      await query(
        `create table if not exists ${EVENT_TABLE} (
           id bigserial primary key,
           agency_id text,
           user_id text not null,
           client_id text,
           event_name text not null,
           source text,
           properties_json jsonb not null default '{}'::jsonb,
           created_at timestamptz not null default now()
         )`,
      );

      await query(
        `create index if not exists ${EVENT_TABLE}_agency_created_at_idx
         on ${EVENT_TABLE} (agency_id, created_at desc)`,
      );

      await query(
        `create index if not exists ${EVENT_TABLE}_agency_client_created_at_idx
         on ${EVENT_TABLE} (agency_id, client_id, created_at desc)`,
      );

      await query(
        `create table if not exists ${SNAPSHOT_TABLE} (
           id bigserial primary key,
           agency_id text,
           client_id text,
           window_days integer not null,
           funnel_stage_key text not null,
           funnel_stage_label text not null,
           trend text not null,
           signal text not null,
           action text not null,
           tone text not null,
           total_events integer not null,
           previous_total_events integer not null,
           total_events_delta integer not null,
           total_events_percent numeric,
           created_at timestamptz not null default now()
         )`,
      );

      await query(
        `create index if not exists ${SNAPSHOT_TABLE}_scope_created_at_idx
         on ${SNAPSHOT_TABLE} (agency_id, client_id, window_days, created_at desc)`,
      );
    })().catch((error) => {
      ensureTablePromise = null;
      throw error;
    });
  }

  return ensureTablePromise;
};

const buildScopeClause = (params: {
  agencyId: string | null;
  clientId: string | null;
  from: string;
  to: string;
}) => ({
  text: `where ($1::text is null or agency_id = $1)
           and ($2::text is null or client_id = $2)
           and created_at >= $3::timestamptz
           and created_at < $4::timestamptz`,
  params: [params.agencyId, params.clientId, params.from, params.to],
});

const loadAggregate = async (params: {
  agencyId: string | null;
  clientId: string | null;
  from: string;
  to: string;
}) => {
  const where = buildScopeClause(params);

  const totalRow = await queryOne<{ total_events: number }>(
    `select count(*)::int as total_events
     from ${EVENT_TABLE}
     ${where.text}`,
    where.params,
  );

  const countRows = await query<{ event_name: string; event_count: number }>(
    `select event_name, count(*)::int as event_count
     from ${EVENT_TABLE}
     ${where.text}
     group by event_name
     order by event_name asc`,
    where.params,
  );

  const lastRow = await queryOne<ProductEventRow>(
    `select id, agency_id, user_id, client_id, event_name, source, properties_json, created_at
     from ${EVENT_TABLE}
     ${where.text}
     order by created_at desc, id desc
     limit 1`,
    where.params,
  );

  return {
    totalEvents: Number(totalRow?.total_events ?? 0),
    counts: countRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.event_name] = Number(row.event_count ?? 0);
      return acc;
    }, {}),
    lastEvent: lastRow
      ? {
          eventName: lastRow.event_name,
          clientId: lastRow.client_id,
          source: lastRow.source,
          timestamp: lastRow.created_at,
        }
      : null,
  } satisfies ProductEventAggregate;
};

const getWindowBounds = (windowDays: number) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - windowDays);

  const previousEnd = new Date(start);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - windowDays);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    previousStart: previousStart.toISOString(),
    previousEnd: previousEnd.toISOString(),
  };
};

const buildFunnelStage = (current: ProductEventAggregate): ProductEventFunnelStage => {
  const consoleOpens = current.counts.console_opened ?? 0;
  const questions = current.counts.assistant_question_sent ?? 0;
  const clears = current.counts.assistant_conversation_cleared ?? 0;

  if (questions >= 3 && consoleOpens >= 2) {
    return { key: "retention", label: "Uso recorrente" };
  }

  if (questions >= 1 && consoleOpens >= 1) {
    return { key: "adoption", label: "Adoção inicial" };
  }

  if (clears > 0) {
    return { key: "reactivation", label: "Reengajamento" };
  }

  if (consoleOpens > 0) {
    return { key: "activation", label: "Ativação inicial" };
  }

  return { key: "discovery", label: "Descoberta" };
};

const loadTopClients = async (params: {
  agencyId: string;
  from: string;
  to: string;
}) =>
  query<ProductEventTopClient>(
    `select
       pe.client_id as "clientId",
       c.name as "clientName",
       count(*)::int as "eventCount",
       max(pe.created_at) as "lastEventAt"
     from ${EVENT_TABLE} pe
     left join clients c
       on c.id = pe.client_id::uuid
      and c.agency_id = pe.agency_id::uuid
     where pe.agency_id = $1
       and pe.created_at >= $2::timestamptz
       and pe.created_at < $3::timestamptz
     group by pe.client_id, c.name
     order by "eventCount" desc, "lastEventAt" desc
     limit 5`,
    [params.agencyId, params.from, params.to],
  );

const loadClientContext = async (params: { agencyId: string | null; clientId: string }) =>
  queryOne<{ name: string; segment: string | null }>(
    `select name, segment
     from clients
     where id = $1
       and ($2::uuid is null or agency_id = $2::uuid)
     limit 1`,
    [params.clientId, params.agencyId],
  );

const buildExecutiveSummary = (params: {
  scope: ProductEventMetrics["scope"];
  current: ProductEventAggregate;
  previous: ProductEventAggregate;
  change: ProductEventMetrics["change"];
  topClients: ProductEventTopClient[];
  clientName?: string | null;
  clientSegment?: string | null;
  funnelStage?: ProductEventFunnelStage;
}): ProductEventExecutiveSummary => {
  const funnelStage = params.funnelStage ?? buildFunnelStage(params.current);

  if (params.current.totalEvents === 0) {
    return {
      trend: "Sem sinais ainda",
      signal: params.scope.clientId ? "Cliente sem eventos no período" : "Nenhum cliente gerou eventos no período",
      action: buildRecommendation(params.clientSegment, params.clientName, funnelStage, true),
      tone: "warning",
    };
  }

  const trend =
    params.change.totalEventsPercent === null
      ? `${params.current.totalEvents} eventos no período`
      : `${params.change.totalEventsDelta >= 0 ? "+" : ""}${params.change.totalEventsDelta} eventos · ${params.change.totalEventsPercent >= 0 ? "+" : ""}${params.change.totalEventsPercent.toFixed(0)}%`;

  const dominantEntry = Object.entries(params.current.counts).sort((a, b) => b[1] - a[1])[0];
  const dominantLabel = dominantEntry ? formatEventLabel(dominantEntry[0]) : "Sem evento dominante";
  const signal = `${funnelStage.label} · ${dominantLabel} lidera com ${dominantEntry?.[1] ?? 0} ocorrências`;

  const action = buildAction(params.current, params.previous, params.topClients, params.scope, params.clientName, params.clientSegment, funnelStage);
  const tone = params.change.totalEventsDelta > 0 ? "positive" : params.change.totalEventsDelta < 0 ? "warning" : "neutral";

  return { trend, signal, action, tone };
};

const formatEventLabel = (eventName: string) => {
  if (eventName === "console_opened") return "Console aberto";
  if (eventName === "client_selected") return "Cliente selecionado";
  if (eventName === "client_context_load_failed") return "Falha ao carregar contexto";
  if (eventName === "client_list_load_failed") return "Falha ao carregar lista";
  if (eventName === "assistant_question_sent") return "Perguntas ao consultor";
  if (eventName === "assistant_conversation_cleared") return "Limpeza de conversa";
  return eventName.split("_").join(" ");
};

const buildAction = (
  current: ProductEventAggregate,
  previous: ProductEventAggregate,
  topClients: ProductEventTopClient[],
  scope: ProductEventMetrics["scope"],
  clientName?: string | null,
  clientSegment?: string | null,
  funnelStage?: ProductEventFunnelStage,
) => {
  if (!scope.clientId && topClients.length > 0) {
    return `Priorize ${topClients[0].clientName ?? "o cliente líder"} para aprofundar o uso.`;
  }

  if (scope.clientId) {
    const stageAction = buildStageAction(funnelStage, clientName, false);
    const segmentAction = buildSegmentAction(clientSegment, clientName, false);

    if (stageAction && segmentAction) return `${stageAction} ${segmentAction}`;
    if (stageAction) return stageAction;
    if (segmentAction) return segmentAction;
  }

  if ((current.counts.assistant_question_sent ?? 0) === 0) {
    return "Faça a primeira pergunta ao consultor para gerar contexto útil.";
  }

  if (current.totalEvents > previous.totalEvents) {
    return "Adoção em alta. Mantenha a cadência e observe se o consultor está sendo acionado no momento certo.";
  }

  return "Mantenha a rotina e valide se o consultor está influenciando decisões do cliente.";
};

const buildRecommendation = (
  clientSegment?: string | null,
  clientName?: string | null,
  funnelStage?: ProductEventFunnelStage,
  emptyPeriod = false,
) => {
  if (!funnelStage) {
    return buildSegmentAction(clientSegment, clientName, emptyPeriod);
  }

  const stageAction = buildStageAction(funnelStage, clientName, emptyPeriod);
  const segmentAction = buildSegmentAction(clientSegment, clientName, emptyPeriod);

  if (stageAction && segmentAction) {
    return `${stageAction} ${segmentAction}`;
  }

  return stageAction || segmentAction;
};

const buildSegmentAction = (clientSegment?: string | null, clientName?: string | null, emptyPeriod = false) => {
  if (!clientSegment) {
    return emptyPeriod
      ? "Estimule o uso do console e das perguntas do consultor."
      : "Mantenha a rotina e valide se o consultor está influenciando decisões do cliente.";
  }

  const segment = clientSegment.toLowerCase();
  const prefix = clientName ? `${clientName} · ` : "";

  if (segment.includes("imob") || segment.includes("constru") || segment.includes("arquitet")) {
    return `${prefix}publique prova social, obra entregue e antes/depois para sustentar autoridade.`;
  }

  if (segment.includes("saúde") || segment.includes("saude") || segment.includes("clín") || segment.includes("clin")) {
    return `${prefix}priorize conteúdo de confiança, credenciais e orientação clara antes de pedir conversão.`;
  }

  if (segment.includes("e-commerce") || segment.includes("varejo") || segment.includes("loja") || segment.includes("retail")) {
    return `${prefix}use ofertas, urgência e CTA curto para acelerar a resposta do cliente.`;
  }

  if (segment.includes("serv") || segment.includes("consult") || segment.includes("b2b")) {
    return `${prefix}ative estudos de caso, objeções resolvidas e prova de resultado no próximo ciclo.`;
  }

  if (emptyPeriod) {
    return `${prefix}estimule o uso do console e das perguntas do consultor.`;
  }

  return `${prefix}mantenha a rotina e valide se o consultor está influenciando decisões do cliente.`;
};

const buildStageAction = (funnelStage: ProductEventFunnelStage | undefined, clientName?: string | null, emptyPeriod = false) => {
  const prefix = clientName ? `${clientName} · ` : "";

  switch (funnelStage?.key) {
    case "retention":
      return `${prefix}padronize a rotina semanal e compare decisões entre ciclos.`;
    case "adoption":
      return emptyPeriod
        ? `${prefix}leve a primeira pergunta ao consultor para validar o client record.`
        : `${prefix}use o consultor antes de publicar para reduzir retrabalho.`;
    case "activation":
      return `${prefix}conecte a próxima pergunta ao client record e valide o contexto antes de avançar.`;
    case "reactivation":
      return `${prefix}retome o último contexto e reabra a conversa com o ponto de maior atrito.`;
    case "discovery":
    default:
      return `${prefix}faça a primeira pergunta ao consultor para gerar contexto útil.`;
  }
};

const persistExecutiveSnapshot = async (input: {
  agencyId: string | null;
  clientId: string | null;
  windowDays: number;
  funnelStage: ProductEventFunnelStage;
  executiveSummary: ProductEventExecutiveSummary;
  currentTotalEvents: number;
  previousTotalEvents: number;
  totalEventsDelta: number;
  totalEventsPercent: number | null;
}) => {
  await query(
    `insert into ${SNAPSHOT_TABLE} (
       agency_id,
       client_id,
       window_days,
       funnel_stage_key,
       funnel_stage_label,
       trend,
       signal,
       action,
       tone,
       total_events,
       previous_total_events,
       total_events_delta,
       total_events_percent
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      input.agencyId,
      input.clientId,
      input.windowDays,
      input.funnelStage.key,
      input.funnelStage.label,
      input.executiveSummary.trend,
      input.executiveSummary.signal,
      input.executiveSummary.action,
      input.executiveSummary.tone,
      input.currentTotalEvents,
      input.previousTotalEvents,
      input.totalEventsDelta,
      input.totalEventsPercent,
    ],
  );
};

const loadExecutiveHistory = async (params: {
  agencyId: string | null;
  clientId: string | null;
  windowDays: number;
}) => {
  const rows = await query<{
    funnelStageKey: ProductEventFunnelStage["key"];
    funnelStageLabel: string;
    trend: string;
    signal: string;
    action: string;
    tone: ProductEventExecutiveSummary["tone"];
    totalEvents: number;
    previousTotalEvents: number;
    totalEventsDelta: number;
    totalEventsPercent: number | string | null;
    createdAt: string;
  }>(
    `select
       funnel_stage_key as "funnelStageKey",
       funnel_stage_label as "funnelStageLabel",
       trend,
       signal,
       action,
       tone,
       total_events as "totalEvents",
       previous_total_events as "previousTotalEvents",
       total_events_delta as "totalEventsDelta",
       total_events_percent as "totalEventsPercent",
       created_at as "createdAt"
     from ${SNAPSHOT_TABLE}
     where ($1::text is null or agency_id = $1)
       and ($2::text is null or client_id = $2)
       and window_days = $3
     order by created_at desc, id desc
     limit 5`,
    [params.agencyId, params.clientId, params.windowDays],
  );

  return rows.map<ProductEventExecutiveSnapshot>((row) => ({
    funnelStageKey: row.funnelStageKey,
    funnelStageLabel: row.funnelStageLabel,
    trend: row.trend,
    signal: row.signal,
    action: row.action,
    tone: row.tone,
    totalEvents: Number(row.totalEvents ?? 0),
    previousTotalEvents: Number(row.previousTotalEvents ?? 0),
    totalEventsDelta: Number(row.totalEventsDelta ?? 0),
    totalEventsPercent:
      row.totalEventsPercent === null || row.totalEventsPercent === undefined ? null : Number(row.totalEventsPercent),
    createdAt: row.createdAt,
  }));
};

const loadExecutiveSnapshotsInWindow = async (params: {
  agencyId: string | null;
  clientId: string | null;
  windowDays: number;
  from: string;
  to: string;
}) =>
  query<{
    funnelStageKey: ProductEventFunnelStage["key"];
    funnelStageLabel: string;
    trend: string;
    signal: string;
    action: string;
    tone: ProductEventExecutiveSummary["tone"];
    totalEvents: number;
    previousTotalEvents: number;
    totalEventsDelta: number;
    totalEventsPercent: number | string | null;
    createdAt: string;
  }>(
    `select
       funnel_stage_key as "funnelStageKey",
       funnel_stage_label as "funnelStageLabel",
       trend,
       signal,
       action,
       tone,
       total_events as "totalEvents",
       previous_total_events as "previousTotalEvents",
       total_events_delta as "totalEventsDelta",
       total_events_percent as "totalEventsPercent",
       created_at as "createdAt"
     from ${SNAPSHOT_TABLE}
     where ($1::text is null or agency_id = $1)
       and ($2::text is null or client_id = $2)
       and window_days = $3
       and created_at >= $4::timestamptz
       and created_at < $5::timestamptz
     order by created_at asc, id asc`,
    [params.agencyId, params.clientId, params.windowDays, params.from, params.to],
  );

export const recordProductEvent = async (input: OfferEventInput) => {
  if (!isDatabaseConfigured()) {
    return null;
  }

  await ensureProductEventsTable();

  return queryOne<ProductEventRow>(
    `insert into ${EVENT_TABLE} (
       agency_id,
       user_id,
       client_id,
       event_name,
       source,
       properties_json
     )
     values ($1, $2, $3, $4, $5, $6::jsonb)
     returning id, agency_id, user_id, client_id, event_name, source, properties_json, created_at`,
    [
      input.agencyId,
      input.userId,
      input.clientId ?? null,
      input.eventName,
      input.source ?? null,
      JSON.stringify(input.properties ?? {}),
    ],
  );
};

export const recordOfferEvent = recordProductEvent;

export const getProductEventMetrics = async (input: {
  agencyId: string | null;
  clientId?: string | null;
  windowDays: number;
}): Promise<ProductEventMetrics> => {
  const scope = {
    agencyId: input.agencyId,
    clientId: input.clientId ?? null,
  };

  if (!isDatabaseConfigured()) {
    return defaultMetrics(scope, input.windowDays);
  }

  await ensureProductEventsTable();

  const bounds = getWindowBounds(input.windowDays);
  const currentPeriod = await loadAggregate({
    agencyId: scope.agencyId,
    clientId: scope.clientId,
    from: bounds.start,
    to: bounds.end,
  });

  const previousPeriod = await loadAggregate({
    agencyId: scope.agencyId,
    clientId: scope.clientId,
    from: bounds.previousStart,
    to: bounds.previousEnd,
  });

  const totalEventsDelta = currentPeriod.totalEvents - previousPeriod.totalEvents;
  const totalEventsPercent =
    previousPeriod.totalEvents > 0 ? (totalEventsDelta / previousPeriod.totalEvents) * 100 : currentPeriod.totalEvents > 0 ? 100 : null;

  const topClients = scope.clientId || !scope.agencyId
    ? []
    : await loadTopClients({
        agencyId: scope.agencyId,
        from: bounds.start,
        to: bounds.end,
      });

  const clientContext = scope.clientId
    ? await loadClientContext({
        agencyId: scope.agencyId,
        clientId: scope.clientId,
      })
    : null;
  const funnelStage = buildFunnelStage(currentPeriod);
  const windowSnapshots = await loadExecutiveSnapshotsInWindow({
    agencyId: scope.agencyId,
    clientId: scope.clientId,
    windowDays: input.windowDays,
    from: bounds.start,
    to: bounds.end,
  });
  const shiftCount = windowSnapshots.reduce((count, row, index, rows) => {
    if (index === 0) return count;
    const previousRow = rows[index - 1];
    const hasShift =
      row.funnelStageKey !== previousRow.funnelStageKey ||
      row.trend !== previousRow.trend ||
      row.action !== previousRow.action ||
      row.tone !== previousRow.tone;
    return hasShift ? count + 1 : count;
  }, 0);
  const snapshotCount = windowSnapshots.length;
  const shiftRate = {
    shiftCount,
    snapshotCount,
    ratePercent: snapshotCount > 1 ? (shiftCount / (snapshotCount - 1)) * 100 : null,
  };
  const executiveSummary = buildExecutiveSummary({
    scope,
    current: currentPeriod,
    previous: previousPeriod,
    change: {
      totalEventsDelta,
      totalEventsPercent,
    },
    topClients,
    clientName: clientContext?.name ?? null,
    clientSegment: clientContext?.segment ?? null,
    funnelStage,
  });

  await persistExecutiveSnapshot({
    agencyId: scope.agencyId,
    clientId: scope.clientId,
    windowDays: input.windowDays,
    funnelStage,
    executiveSummary,
    currentTotalEvents: currentPeriod.totalEvents,
    previousTotalEvents: previousPeriod.totalEvents,
    totalEventsDelta,
    totalEventsPercent,
  });

  const summaryHistory = await loadExecutiveHistory({
    agencyId: scope.agencyId,
    clientId: scope.clientId,
    windowDays: input.windowDays,
  });

  return {
    scope,
    windowDays: input.windowDays,
    funnelStage,
    executiveSummary,
    shiftRate,
    summaryHistory,
    currentPeriod: {
      start: bounds.start,
      end: bounds.end,
      aggregate: currentPeriod,
    },
    previousPeriod: {
      start: bounds.previousStart,
      end: bounds.previousEnd,
      aggregate: previousPeriod,
    },
    change: {
      totalEventsDelta,
      totalEventsPercent,
    },
    topClients,
  };
};

export const getOfferEventMetrics = getProductEventMetrics;
