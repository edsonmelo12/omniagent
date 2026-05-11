import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { backendApi } from "@/lib/backendApi";
import { recordOfferMetric } from "@/lib/productMetrics";
import { subscribeOfferMetricEvents } from "@/lib/productMetrics";
import { DisplayModeToggle } from "@/components/DisplayModeToggle";
import { EmptyStatePanel } from "@/components/EmptyStatePanel";
import { ptBR } from "@/i18n/pt-BR";
import type { ProductEventExecutiveSnapshot, ProductEventMetrics } from "@/types/backend";

type ProductMetricsPanelProps = {
  clientId?: string | null;
};

type WindowOption = 7 | 30 | 90;

const defaultMetrics = (clientId: string | null, windowDays: WindowOption): ProductEventMetrics => ({
  scope: {
    agencyId: null,
    clientId,
  },
  windowDays,
  funnelStage: {
    key: "discovery",
    label: "Descoberta",
  },
  executiveSummary: {
    trend: "Sem sinais ainda",
    signal: clientId ? "Cliente sem eventos no período" : "Nenhum cliente gerou eventos no período",
    action: clientId
      ? "Estimule o uso do console e das perguntas do consultor."
      : "Priorize um cliente para aprofundar o uso.",
    tone: "warning",
  },
  shiftRate: {
    shiftCount: 0,
    snapshotCount: 0,
    ratePercent: null,
  },
  summaryHistory: [],
  currentPeriod: {
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    aggregate: {
      totalEvents: 0,
      counts: {},
      lastEvent: null,
    },
  },
  previousPeriod: {
    start: new Date().toISOString(),
    end: new Date().toISOString(),
    aggregate: {
      totalEvents: 0,
      counts: {},
      lastEvent: null,
    },
  },
  change: {
    totalEventsDelta: 0,
    totalEventsPercent: null,
  },
  topClients: [],
});

export function ProductMetricsPanel({ clientId }: ProductMetricsPanelProps) {
  const [windowDays, setWindowDays] = useState<WindowOption>(7);
  const [metrics, setMetrics] = useState<ProductEventMetrics>(() => defaultMetrics(clientId ?? null, windowDays));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadMetrics = async () => {
      setLoading(true);

      try {
        const response = await backendApi.loadOfferMetrics(clientId ?? null, windowDays);
        if (!cancelled) {
          setMetrics(response);
        }
      } catch {
        if (!cancelled) {
          setMetrics(defaultMetrics(clientId ?? null, windowDays));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMetrics();

    const unsubscribe = subscribeOfferMetricEvents(() => {
      void loadMetrics();
    });

    const interval = window.setInterval(() => {
      void loadMetrics();
    }, 30000);

    return () => {
      cancelled = true;
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [clientId, windowDays]);

  const metricsText = ptBR.dashboard.offerMetrics;
  const scopeLabel = clientId ? metricsText.clientScope : metricsText.agencyScope;
  const windowLabel = useMemo(() => {
    if (windowDays === 7) return metricsText.window7d;
    if (windowDays === 30) return metricsText.window30d;
    return metricsText.window90d;
  }, [windowDays]);

  const current = metrics.currentPeriod.aggregate;
  const previous = metrics.previousPeriod.aggregate;
  const deltaLabel = formatDelta(metrics.change.totalEventsDelta, metrics.change.totalEventsPercent);
  const executiveSummary = metrics.executiveSummary;
  const shiftRate = metrics.shiftRate;
  const summaryHistory = metrics.summaryHistory.slice(0, 3);
  const latestSnapshot = summaryHistory[0] ?? null;
  const previousSnapshot = summaryHistory[1] ?? null;
  const summaryShift = buildSummaryShift(executiveSummary, latestSnapshot, previousSnapshot);
  const loadFailures = (current.counts.client_context_load_failed ?? 0) + (current.counts.client_list_load_failed ?? 0);

  useEffect(() => {
    if (!summaryShift || !latestSnapshot) return;

    const storageKeys = getShiftTrackingStorageKeys(clientId ?? null, windowDays);
    const signature = summaryShift.signature;

    if (
      typeof window !== "undefined" &&
      (window.localStorage.getItem(storageKeys.primary) === signature || window.localStorage.getItem(storageKeys.legacy) === signature)
    ) {
      return;
    }

    recordOfferMetric({
      eventName: "executive_summary_shift_detected",
      clientId,
      source: "product-metrics-panel",
    });
    void backendApi.trackOfferEvent({
      eventName: "executive_summary_shift_detected",
      clientId: clientId ?? undefined,
      source: "product-metrics-panel",
      properties: {
        scope: clientId ? "client" : "agency",
        funnelStageFrom: summaryShift.from,
        funnelStageTo: summaryShift.to,
        kind: summaryShift.kind,
        tone: summaryShift.tone,
        latestSnapshotAt: latestSnapshot.createdAt,
      },
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.primary, signature);
      window.localStorage.setItem(storageKeys.legacy, signature);
    }
  }, [clientId, latestSnapshot, summaryShift, windowDays]);

  return (
    <section className="section-card animate-rise-in" style={panelStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>{metricsText.eyebrow}</div>
          <h2 style={titleStyle}>{metricsText.title}</h2>
        </div>
        <div style={subtitleWrapStyle}>
          <div style={subtitleStyle}>{loading ? metricsText.loading : `${metricsText.subtitle} ${scopeLabel}.`}</div>
          <DisplayModeToggle
            label={metricsText.windowLabel}
            value={windowDays}
            options={[
              { label: metricsText.window7d, value: 7 },
              { label: metricsText.window30d, value: 30 },
              { label: metricsText.window90d, value: 90 },
            ]}
            onChange={(value) => setWindowDays(value as WindowOption)}
          />
        </div>
      </div>

      <div style={summaryGridStyle}>
        <SummaryCard label={metricsText.summaryTrend} value={executiveSummary.trend} tone={executiveSummary.tone} />
        <SummaryCard label={metricsText.summarySignal} value={executiveSummary.signal} tone="neutral" />
        <SummaryCard label={metricsText.summaryAction} value={executiveSummary.action} tone="accent" />
      </div>

      {summaryShift ? (
        <div style={shiftStyle(summaryShift.tone)}>
          <div style={shiftHeaderStyle}>
            <div style={shiftLabelStyle}>{metricsText.summaryShift}</div>
            <div style={shiftToneStyle(summaryShift.tone)}>{summaryShift.kind}</div>
          </div>
          <div style={shiftBodyStyle}>{summaryShift.description}</div>
          <div style={shiftMetaStyle}>
            <span>{metricsText.summaryShiftFrom}: {summaryShift.from}</span>
            <span>{metricsText.summaryShiftTo}: {summaryShift.to}</span>
          </div>
        </div>
      ) : null}

      <div style={rateStyle}>
        <div style={rateHeaderStyle}>
          <div style={rateLabelStyle}>{metricsText.shiftRate}</div>
          <div style={rateValueStyle}>{formatShiftRate(shiftRate.ratePercent)}</div>
        </div>
        <div style={rateMetaStyle}>
          {shiftRate.shiftCount} {metricsText.shiftChanges} · {shiftRate.snapshotCount} {metricsText.shiftSnapshots}
        </div>
      </div>

      <div style={metricsGridStyle}>
        <Metric label={metricsText.totalEvents} value={current.totalEvents} hint={`${metricsText.previousWindow} ${previous.totalEvents}`} />
        <Metric label={metricsText.consoleOpens} value={current.counts.console_opened ?? 0} hint={deltaFor("console_opened", current, previous)} />
        <Metric label={metricsText.clientSelections} value={current.counts.client_selected ?? 0} hint={deltaFor("client_selected", current, previous)} />
        <Metric label={metricsText.assistantQuestions} value={current.counts.assistant_question_sent ?? 0} hint={deltaFor("assistant_question_sent", current, previous)} />
        <Metric label={metricsText.loadFailures} value={loadFailures} hint={`${deltaFor("client_context_load_failed", current, previous)} · ${deltaFor("client_list_load_failed", current, previous)}`} />
        <Metric label={metricsText.conversationClears} value={current.counts.assistant_conversation_cleared ?? 0} hint={deltaFor("assistant_conversation_cleared", current, previous)} />
      </div>

      {current.totalEvents === 0 && summaryHistory.length === 0 ? (
        <EmptyStatePanel
          title="Sem sinais suficientes ainda"
          body="Abra o console, envie uma pergunta ao consultor ou troque de cliente para começar a gerar leitura persistida."
        />
      ) : null}

      <div style={comparisonStyle}>
        <div style={comparisonHeaderStyle}>
          <div style={comparisonLabelStyle}>{metricsText.comparison}</div>
          <div style={comparisonValueStyle}>{deltaLabel}</div>
        </div>
        <div style={comparisonMetaStyle}>
          {loading ? metricsText.loading : `${windowLabel} · ${scopeLabel.toLowerCase()}`}
        </div>
      </div>

      {summaryHistory.length > 0 ? (
        <div style={historyStyle}>
          <div style={historyLabelStyle}>{metricsText.summaryHistory}</div>
          <div style={historyListStyle}>
            {summaryHistory.map((snapshot) => (
              <div key={snapshot.createdAt} style={historyItemStyle}>
                <div style={historyItemHeaderStyle}>
                  <span style={historyStageStyle}>{snapshot.funnelStageLabel}</span>
                  <span style={historyDeltaStyle(snapshot.tone)}>{formatDelta(snapshot.totalEventsDelta, snapshot.totalEventsPercent)}</span>
                </div>
                <div style={historyItemSignalStyle}>{snapshot.signal}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!clientId && metrics.topClients.length > 0 ? (
        <div style={topClientsStyle}>
          <div style={topClientsLabelStyle}>{metricsText.topClients}</div>
          <div style={topClientsListStyle}>
            {metrics.topClients.map((client) => (
              <div key={`${client.clientId ?? "unknown"}-${client.clientName ?? "unknown"}`} style={topClientItemStyle}>
                <div style={topClientNameStyle}>{client.clientName ?? metricsText.unknownClient}</div>
                <div style={topClientMetaStyle}>
                  {client.eventCount} {metricsText.events}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={footerStyle}>
        <div style={footerLabelStyle}>{metricsText.lastEvent}</div>
        <div style={footerValueStyle}>
          {current.lastEvent
            ? `${current.lastEvent.eventName} · ${current.lastEvent.source ?? "dashboard"} · ${new Date(current.lastEvent.timestamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : metricsText.empty}
        </div>
      </div>
    </section>
  );
}

export const OfferMetricsPanel = ProductMetricsPanel;

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: "neutral" | "positive" | "warning" | "accent" }) {
  return (
    <div style={summaryCardStyle(tone)}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div style={metricStyle}>
      <div style={metricLabelStyle}>{label}</div>
      <div style={metricValueStyle}>{value}</div>
      {hint ? <div style={metricHintStyle}>{hint}</div> : null}
    </div>
  );
}

function formatDelta(delta: number, percent: number | null) {
  if (delta === 0) return "Sem variação";

  const prefix = delta > 0 ? "+" : "";
  const suffix = percent !== null ? ` (${percent > 0 ? "+" : ""}${percent.toFixed(0)}%)` : "";
  return `${prefix}${delta}${suffix}`;
}

function deltaFor(
  key: string,
  current: ProductEventMetrics["currentPeriod"]["aggregate"],
  previous: ProductEventMetrics["previousPeriod"]["aggregate"],
) {
  const currentValue = current.counts[key] ?? 0;
  const previousValue = previous.counts[key] ?? 0;
  const delta = currentValue - previousValue;

  if (delta === 0) return "Sem variação";
  return `${delta > 0 ? "+" : ""}${delta} vs janela anterior`;
}

function formatShiftRate(ratePercent: number | null) {
  if (ratePercent === null) return "Sem base suficiente";
  return `${ratePercent.toFixed(0)}%`;
}

function buildSummaryShift(
  current: ProductEventMetrics["executiveSummary"],
  latest: ProductEventExecutiveSnapshot | null,
  previous: ProductEventExecutiveSnapshot | null,
) {
  if (!latest || !previous) return null;

  const actionChanged = latest.action !== previous.action;
  const trendChanged = latest.trend !== previous.trend;
  const toneChanged = latest.tone !== previous.tone;

  if (!actionChanged && !trendChanged && !toneChanged) {
    return null;
  }

  const kind = toneChanged && current.tone !== previous.tone
    ? current.tone === "positive"
      ? "Virada positiva"
      : current.tone === "warning"
        ? "Sinal de atenção"
        : "Virada neutra"
    : actionChanged
      ? "Mudança de ação"
      : "Mudança de leitura";

  const changedParts = [
    trendChanged ? `tendência: ${previous.trend} → ${current.trend}` : null,
    actionChanged ? "ação: houve ajuste na recomendação" : null,
    toneChanged ? `tom: ${previous.tone} → ${current.tone}` : null,
  ].filter(Boolean);

  return {
    signature: `${latest.createdAt}:${previous.createdAt}:${current.trend}:${current.action}:${current.tone}`,
    kind,
    tone: current.tone,
    description: changedParts.length > 0 ? changedParts.join(" · ") : "A leitura executiva mudou entre os dois últimos snapshots.",
    from: previous.funnelStageLabel,
    to: latest.funnelStageLabel,
  };
}

function getShiftTrackingStorageKeys(clientId: string | null, windowDays: number) {
  return {
    primary: `omniagent.offerMetrics.shift.${clientId ?? "agency"}.${windowDays}`,
    legacy: `omniagent.productMetrics.shift.${clientId ?? "agency"}.${windowDays}`,
  };
}

const panelStyle: React.CSSProperties = {
  padding: 24,
  marginBottom: 24,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.06), transparent 36%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 18,
};

const subtitleWrapStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: 10,
};

const eyebrowStyle: React.CSSProperties = {
  color: "var(--accent-cyan)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: 11,
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 20,
  lineHeight: 1.1,
  color: "var(--text-primary)",
};

const subtitleStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 13,
  maxWidth: 280,
  textAlign: "right",
};

const metricsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 12,
};

const metricStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const metricLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  marginBottom: 8,
};

const metricValueStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1,
};

const metricHintStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--text-secondary)",
  fontSize: 12,
};

const summaryCardStyle = (tone: "neutral" | "positive" | "warning" | "accent"): React.CSSProperties => ({
  padding: 14,
  borderRadius: 16,
  background:
    tone === "accent"
      ? "rgba(0, 212, 255, 0.08)"
      : tone === "positive"
        ? "rgba(35, 132, 67, 0.12)"
        : tone === "warning"
          ? "rgba(166, 93, 0, 0.16)"
          : "rgba(255,255,255,0.03)",
  border:
    tone === "accent"
      ? "1px solid rgba(0, 212, 255, 0.16)"
      : "1px solid rgba(255,255,255,0.08)",
});

const summaryLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
  fontWeight: 700,
};

const summaryValueStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 14,
  lineHeight: 1.5,
  fontWeight: 600,
};

const comparisonStyle: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const comparisonHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const comparisonLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const comparisonValueStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 16,
  fontWeight: 700,
};

const comparisonMetaStyle: React.CSSProperties = {
  marginTop: 6,
  color: "var(--text-secondary)",
  fontSize: 13,
};

const rateStyle: React.CSSProperties = {
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const rateHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const rateLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontWeight: 700,
};

const rateValueStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 16,
  fontWeight: 700,
};

const rateMetaStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--text-secondary)",
  fontSize: 12,
};

const shiftStyle = (tone: "neutral" | "positive" | "warning"): React.CSSProperties => ({
  marginTop: 14,
  padding: 14,
  borderRadius: 16,
  background:
    tone === "positive"
      ? "rgba(35, 132, 67, 0.10)"
      : tone === "warning"
        ? "rgba(166, 93, 0, 0.14)"
        : "rgba(255,255,255,0.03)",
  border:
    tone === "positive"
      ? "1px solid rgba(35, 132, 67, 0.35)"
      : tone === "warning"
        ? "1px solid rgba(166, 93, 0, 0.35)"
        : "1px solid rgba(255,255,255,0.08)",
});

const shiftHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 8,
};

const shiftLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontWeight: 700,
};

const shiftToneStyle = (tone: "neutral" | "positive" | "warning"): React.CSSProperties => ({
  color: tone === "positive" ? "var(--success)" : tone === "warning" ? "var(--warning)" : "var(--text-muted)",
  fontSize: 12,
  fontWeight: 700,
});

const shiftBodyStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: 600,
};

const shiftMetaStyle: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  color: "var(--text-secondary)",
  fontSize: 12,
};

const historyStyle: React.CSSProperties = {
  marginTop: 18,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const historyLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 10,
};

const historyListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const historyItemStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.03)",
};

const historyItemHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginBottom: 6,
};

const historyStageStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 12,
  fontWeight: 700,
};

const historyDeltaStyle = (tone: "neutral" | "positive" | "warning") => ({
  color: tone === "positive" ? "var(--success)" : tone === "warning" ? "var(--warning)" : "var(--text-muted)",
  fontSize: 12,
  fontWeight: 700,
});

const historyItemSignalStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  lineHeight: 1.45,
};

const topClientsStyle: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const topClientsLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 12,
};

const topClientsListStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const topClientItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "12px 14px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const topClientNameStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 14,
  fontWeight: 600,
};

const topClientMetaStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 13,
};

const footerStyle: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const footerLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 6,
};

const footerValueStyle: React.CSSProperties = {
  color: "var(--text-primary)",
  fontSize: 14,
  lineHeight: 1.5,
};
