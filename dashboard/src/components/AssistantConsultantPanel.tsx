import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppIcon } from "@/components/AppIcon";
import { backendApi } from "@/lib/backendApi";
import { recordOfferMetric } from "@/lib/productMetrics";
import { ArtifactSummaryCard } from "@/components/ArtifactSummaryCard";
import { ptBR } from "@/i18n/pt-BR";
import type { Client } from "@/types/backend";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  summary?: string;
  recommendations?: string[];
  risks?: string[];
  nextQuestions?: string[];
  sources?: string[];
  context?: {
    campaignStage?: string;
    campaignBlockers?: string[];
    organicLaunchReadiness?: "bloqueado" | "em preparação" | "pronto";
    organicLaunchReason?: string;
    organicLaunchNextStep?: string;
  };
};

type AssistantConsultantPanelProps = {
  client: Client | null;
};

type StoredMessage = Pick<AssistantMessage, "role" | "content">;

const DEFAULT_PROMPTS = [
  "Executar a agenda atual",
  "Priorizar o gargalo principal",
  "Fechar o ciclo atual",
];

const HISTORY_LIMIT = 12;

const getStorageKey = (clientId: string) => `omniagent.assistant.history.${clientId}`;

const readStoredHistory = (clientId: string): StoredMessage[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(clientId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): StoredMessage | null => {
        if (!item || typeof item !== "object") return null;
        const role = (item as { role?: unknown }).role;
        const content = (item as { content?: unknown }).content;
        if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
        return { role: role as StoredMessage["role"], content: content.trim() };
      })
      .filter((item): item is StoredMessage => Boolean(item))
      .slice(-HISTORY_LIMIT);
  } catch {
    return [];
  }
};

const storeHistory = (clientId: string, messages: StoredMessage[]) => {
  localStorage.setItem(getStorageKey(clientId), JSON.stringify(messages.slice(-HISTORY_LIMIT)));
};

export function AssistantConsultantPanel({ client }: AssistantConsultantPanelProps) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState(DEFAULT_PROMPTS);
  const [threadSummary, setThreadSummary] = useState<string>(ptBR.dashboard.assistant.threadEmpty);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);
  const historyRef = useRef<StoredMessage[]>([]);
  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant") ?? null,
    [messages],
  );

  const clientLabel = useMemo(() => client?.name ?? ptBR.dashboard.assistant.emptyClient, [client]);
  const conversationMetrics = useMemo(
    () => [
      { label: ptBR.dashboard.assistant.summary.messages, value: messages.length },
      { label: ptBR.dashboard.assistant.summary.assistantReplies, value: messages.filter((message) => message.role === "assistant").length },
      { label: ptBR.dashboard.assistant.summary.userQuestions, value: messages.filter((message) => message.role === "user").length },
      { label: ptBR.dashboard.assistant.summary.sources, value: latestAssistantMessage?.sources?.length ?? 0 },
    ],
    [latestAssistantMessage?.sources?.length, messages],
  );
  const conversationBullets = useMemo(
    () => [
      latestAssistantMessage?.summary,
      ...(latestAssistantMessage?.recommendations ?? []).slice(0, 2),
      ...(latestAssistantMessage?.risks ?? []).slice(0, 2),
    ].filter((item): item is string => typeof item === "string" && item.trim().length > 0),
    [latestAssistantMessage],
  );
  const campaignBlocker = latestAssistantMessage?.context?.campaignBlockers?.[0] ?? null;
  const campaignAction = latestAssistantMessage?.recommendations?.[0] ?? null;
  const campaignStage = latestAssistantMessage?.context?.campaignStage ?? null;
  const organicLaunchReadiness = latestAssistantMessage?.context?.organicLaunchReadiness ?? null;
  const organicLaunchReason = latestAssistantMessage?.context?.organicLaunchReason ?? null;
  const organicLaunchNextStep = latestAssistantMessage?.context?.organicLaunchNextStep ?? null;
  const campaignFlowState = campaignBlocker
    ? /stale|atualiza|regerar|desatual/i.test(campaignBlocker)
      ? "em correção"
      : "bloqueado"
    : "pronto para avançar";
  const campaignFlowIndex = {
    bloqueado: 0,
    "em correção": 1,
    "pronto para avançar": 2,
  }[campaignFlowState];

  const hydrateAssistant = async (clientId: string) => {
    const stored = readStoredHistory(clientId);
    historyRef.current = stored;
    setMessages(
      stored.map((message, index) => ({
        id: `stored-${clientId}-${index}`,
        role: message.role,
        content: message.content,
      })),
    );
    setThreadSummary(stored.length > 0 ? ptBR.dashboard.assistant.threadRestored(stored.length) : ptBR.dashboard.assistant.threadEmpty);

    if (stored.length > 0) {
      setSuggestions(DEFAULT_PROMPTS);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const response = await backendApi.consultClient(clientId, { history: stored });
      if (requestId !== requestIdRef.current) return;

      const assistantMessage: AssistantMessage = {
        id: `assistant-${requestId}`,
        role: "assistant",
        content: response.answer,
        summary: response.summary,
        recommendations: response.recommendations,
        risks: response.risks,
        nextQuestions: response.nextQuestions,
        sources: response.sources,
        context: response.context,
      };

      setMessages([...stored.map((message, index) => ({ id: `stored-${clientId}-${index}`, ...message })), assistantMessage]);
      setThreadSummary(response.threadSummary);
      setSuggestions(response.nextQuestions.length > 0 ? response.nextQuestions : DEFAULT_PROMPTS);
      historyRef.current = [...stored, { role: "assistant", content: response.answer } as StoredMessage];
      storeHistory(clientId, historyRef.current);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      const fallback = ptBR.dashboard.assistant.emptyState;
      setError(err instanceof Error ? err.message : ptBR.dashboard.assistant.statuses.failed);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${requestId}`,
          role: "assistant",
          content: fallback,
        },
      ]);
      historyRef.current = [...stored, { role: "assistant", content: fallback } as StoredMessage];
      storeHistory(clientId, historyRef.current);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }
  };

  useEffect(() => {
    setMessages([]);
    setDraft("");
    setError(null);
    setSuggestions(DEFAULT_PROMPTS);
    setThreadSummary(ptBR.dashboard.assistant.threadEmpty);

    if (!client?.id) {
      return;
    }

    void hydrateAssistant(client.id);
  }, [client?.id]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendQuestion = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || !client?.id || loading) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextHistory: StoredMessage[] = [...historyRef.current, { role: "user", content: trimmed } as StoredMessage].slice(-HISTORY_LIMIT);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setLoading(true);
    historyRef.current = nextHistory;
    storeHistory(client.id, nextHistory);
    recordOfferMetric({
      eventName: "assistant_question_sent",
      clientId: client.id,
      source: "assistant-panel",
    });
    void backendApi.trackOfferEvent({
      eventName: "assistant_question_sent",
      clientId: client.id,
      source: "assistant-panel",
      properties: {
        questionLength: trimmed.length,
      },
    });

    const requestId = ++requestIdRef.current;

    try {
      const response = await backendApi.consultClient(client.id, {
        question: trimmed,
        history: nextHistory,
      });
      if (requestId !== requestIdRef.current) return;

      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        summary: response.summary,
        recommendations: response.recommendations,
        risks: response.risks,
        nextQuestions: response.nextQuestions,
        sources: response.sources,
        context: response.context,
      };

      const finalMessages = [...nextMessages, assistantMessage];
      setMessages(finalMessages);
      setThreadSummary(response.threadSummary);
      setSuggestions(response.nextQuestions.length > 0 ? response.nextQuestions : DEFAULT_PROMPTS);
      historyRef.current = [...nextHistory, { role: "assistant", content: response.answer } as StoredMessage].slice(-HISTORY_LIMIT);
      storeHistory(client.id, historyRef.current);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      const fallback = err instanceof Error ? err.message : ptBR.dashboard.assistant.statuses.failed;
      setMessages([
        ...nextMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: fallback,
        },
      ]);
      setError(fallback);
      historyRef.current = [...nextHistory, { role: "assistant", content: fallback } as StoredMessage].slice(-HISTORY_LIMIT);
      storeHistory(client.id, historyRef.current);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }
  };

  const clearConversation = () => {
    if (!client?.id) return;

    const clearedMessages = historyRef.current.length;
    localStorage.removeItem(getStorageKey(client.id));
    historyRef.current = [];
    setMessages([]);
    setSuggestions(DEFAULT_PROMPTS);
    setThreadSummary(ptBR.dashboard.assistant.threadEmpty);
    setError(null);
    setDraft("");
    recordOfferMetric({
      eventName: "assistant_conversation_cleared",
      clientId: client.id,
      source: "assistant-panel",
    });
    void backendApi.trackOfferEvent({
      eventName: "assistant_conversation_cleared",
      clientId: client.id,
      source: "assistant-panel",
      properties: {
        messagesCleared: clearedMessages,
      },
    });
  };

  return (
    <section className="section-card animate-rise-in" style={assistantShellStyle}>
      <div style={assistantHeaderStyle}>
        <div>
          <div style={assistantEyebrowStyle}>{ptBR.dashboard.assistant.eyebrow}</div>
          <h3 style={assistantTitleStyle}>{ptBR.dashboard.assistant.title}</h3>
          <p style={assistantSubtitleStyle}>{ptBR.dashboard.assistant.subtitle}</p>
        </div>
        <div style={assistantHeaderActionsStyle}>
          <div style={assistantClientBadgeStyle}>{clientLabel}</div>
          <button type="button" style={assistantClearButtonStyle} onClick={clearConversation} disabled={!client?.id}>
            {ptBR.dashboard.assistant.clear}
          </button>
        </div>
      </div>

      <div style={assistantStatusBarStyle}>
        <span style={assistantStatusPillStyle(loading)}>{loading ? ptBR.dashboard.assistant.statuses.loading : ptBR.dashboard.assistant.statuses.ready}</span>
        <span style={assistantStatusHintStyle}>{error ?? threadSummary ?? ptBR.dashboard.assistant.statuses.hint}</span>
      </div>

      {latestAssistantMessage ? (
        <div style={assistantDecisionRailStyle}>
          <div style={assistantActionPanelStyle}>
            <div style={assistantActionEyebrowStyle}>{ptBR.dashboard.assistant.summary.title}</div>
            <div style={assistantActionTitleStyle}>{campaignAction ?? "Ação recomendada indisponível."}</div>
            <div style={assistantFlowStyle}>
              {[
                { key: "bloqueado", label: "Bloqueado" },
                { key: "em correção", label: "Em correção" },
                { key: "pronto para avançar", label: "Pronto para avançar" },
              ].map((step, index, steps) => {
                const stepState = index < campaignFlowIndex ? "done" : index === campaignFlowIndex ? "active" : "pending";
                const iconName =
                  stepState === "active"
                    ? "sync"
                    : stepState === "done"
                      ? "verified"
                      : "schedule";

                return (
                  <React.Fragment key={step.key}>
                    <div style={assistantFlowStepStyle(stepState)}>
                      <AppIcon name={iconName} style={assistantFlowIconStyle(stepState)} />
                      <span>{step.label}</span>
                    </div>
                    {index < steps.length - 1 ? (
                      <span style={assistantFlowConnectorStyle(index < campaignFlowIndex ? "done" : index === campaignFlowIndex ? "active" : "pending")} />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
            <div style={assistantActionMetaStyle}>
              <span>{organicLaunchReadiness ? `Orgânico: ${organicLaunchReadiness}` : "Orgânico: indefinido"}</span>
              <span>{organicLaunchReason ?? "Sem leitura orgânica"}</span>
              <span>{organicLaunchNextStep ?? "Sem próximo passo"}</span>
              <span>{campaignStage ? `Etapa: ${campaignStage}` : "Etapa: indefinida"}</span>
              <span>{campaignBlocker ? `Bloqueio: ${campaignBlocker}` : "Sem bloqueio estrutural"}</span>
            </div>
          </div>
          <ArtifactSummaryCard
            title={ptBR.dashboard.assistant.summary.title}
            subtitle={threadSummary}
            metrics={conversationMetrics}
            bullets={conversationBullets}
            emptyBulletLabel={ptBR.dashboard.assistant.summary.empty}
          />
        </div>
      ) : (
        <ArtifactSummaryCard
          title={ptBR.dashboard.assistant.summary.title}
          subtitle={threadSummary}
          metrics={conversationMetrics}
          bullets={conversationBullets}
          emptyBulletLabel={ptBR.dashboard.assistant.summary.empty}
        />
      )}

      <div ref={feedRef} style={assistantFeedStyle} className="soft-scrollbar">
        {messages.length === 0 ? (
          <div style={assistantEmptyStyle}>{ptBR.dashboard.assistant.emptyState}</div>
        ) : (
          messages.map((message) => (
            <article key={message.id} style={assistantMessageStyle(message.role)}>
              <div style={assistantMessageMetaStyle}>
                <span style={assistantMessageRoleStyle}>{message.role === "assistant" ? ptBR.dashboard.assistant.roles.assistant : ptBR.dashboard.assistant.roles.user}</span>
                {message.summary ? <span style={assistantSummaryStyle}>{message.summary}</span> : null}
              </div>
              <div style={assistantMessageContentStyle(message.role)}>{message.content}</div>
              {message.recommendations?.length ? (
                <div style={assistantListBlockStyle}>
                  <div style={assistantListLabelStyle}>{ptBR.dashboard.assistant.recommendations}</div>
                  <ul style={assistantListStyle}>
                    {message.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {message.risks?.length ? (
                <div style={assistantListBlockStyle}>
                  <div style={assistantListLabelStyle}>{ptBR.dashboard.assistant.risks}</div>
                  <ul style={assistantListStyle}>
                    {message.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {message.sources?.length ? (
                <div style={assistantSourcesStyle}>
                  {message.sources.map((source) => (
                    <span key={source} style={assistantSourceChipStyle}>
                      {source}
                    </span>
                  ))}
                </div>
              ) : null}
              {message.nextQuestions?.length ? (
                <div style={assistantPromptListStyle}>
                  {message.nextQuestions.map((prompt) => (
                    <button key={prompt} type="button" style={assistantPromptButtonStyle} onClick={() => void sendQuestion(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>

      <div style={assistantSuggestionsStyle}>
        <div style={assistantSuggestionsLabelStyle}>{ptBR.dashboard.assistant.suggestions}</div>
        <div style={assistantSuggestionButtonsStyle}>
          {suggestions.map((prompt) => (
            <button key={prompt} type="button" style={assistantSuggestionButtonStyle} onClick={() => void sendQuestion(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div style={assistantComposerStyle}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={ptBR.dashboard.assistant.inputPlaceholder}
          rows={3}
          style={assistantInputStyle}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendQuestion(draft);
            }
          }}
        />
        <button type="button" style={assistantSendButtonStyle} onClick={() => void sendQuestion(draft)} disabled={loading || draft.trim().length === 0}>
          {ptBR.dashboard.assistant.send}
        </button>
      </div>
    </section>
  );
}

const assistantShellStyle: React.CSSProperties = {
  marginBottom: 24,
  padding: 24,
  background:
    "radial-gradient(circle at top, rgba(0, 212, 255, 0.06), transparent 36%), linear-gradient(180deg, rgba(10, 12, 18, 0.98) 0%, rgba(14, 15, 24, 0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
};

const assistantHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
};

const assistantHeaderActionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const assistantEyebrowStyle: React.CSSProperties = {
  color: "var(--accent-cyan)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: 11,
  fontWeight: 700,
};

const assistantTitleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 22,
  lineHeight: 1.1,
  color: "var(--text-primary)",
};

const assistantSubtitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  color: "var(--text-secondary)",
  fontSize: 14,
};

const assistantClientBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(0, 212, 255, 0.16)",
  background: "rgba(0, 212, 255, 0.08)",
  color: "var(--accent-cyan)",
  fontSize: 12,
  fontWeight: 600,
};

const assistantClearButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-primary)",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 12,
  cursor: "pointer",
};

const assistantStatusBarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginTop: 16,
  marginBottom: 16,
};

const assistantStatusPillStyle = (loading: boolean): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: loading ? "rgba(245, 158, 11, 0.16)" : "rgba(0, 212, 255, 0.08)",
  color: loading ? "#f59e0b" : "var(--accent-cyan)",
  fontSize: 12,
  fontWeight: 600,
});

const assistantStatusHintStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 13,
  textAlign: "right",
};

const assistantDecisionRailStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  marginBottom: 14,
};

const assistantActionPanelStyle: React.CSSProperties = {
  padding: "16px 18px",
  borderRadius: 18,
  border: "1px solid rgba(0, 212, 255, 0.22)",
  background:
    "linear-gradient(135deg, rgba(0, 212, 255, 0.16) 0%, rgba(0, 0, 0, 0.18) 55%, rgba(9, 14, 24, 0.92) 100%)",
  boxShadow: "0 16px 32px rgba(0, 0, 0, 0.2)",
};

const assistantActionEyebrowStyle: React.CSSProperties = {
  color: "var(--accent-cyan)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontSize: 11,
  fontWeight: 800,
};

const assistantActionTitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: "var(--text-primary)",
  fontSize: 15,
  lineHeight: 1.5,
  fontWeight: 700,
};

const assistantFlowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 12,
  flexWrap: "nowrap",
};

const assistantFlowStepStyle = (state: "done" | "active" | "pending"): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 10px",
  minHeight: 34,
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.2,
  whiteSpace: "nowrap",
  color:
    state === "active"
      ? "rgba(255,255,255,0.98)"
      : state === "done"
        ? "rgba(200,214,255,0.92)"
        : "var(--text-secondary)",
  background:
    state === "active"
      ? "linear-gradient(135deg, rgba(0, 212, 255, 0.94), rgba(107,56,212,0.92))"
      : state === "done"
        ? "rgba(0, 212, 255, 0.12)"
        : "rgba(255,255,255,0.05)",
  border:
    state === "active"
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(255,255,255,0.08)",
  boxShadow: state === "active" ? "0 10px 22px rgba(0, 212, 255, 0.18)" : "none",
  animation: state === "active" ? "pulseAccent 2.2s ease-in-out infinite" : "none",
});

const assistantFlowIconStyle = (state: "done" | "active" | "pending"): React.CSSProperties => ({
  width: 14,
  height: 14,
  flex: "0 0 auto",
  color:
    state === "active"
      ? "#ffffff"
      : state === "done"
        ? "rgba(0, 212, 255, 0.96)"
        : "rgba(255,255,255,0.38)",
  animation: state === "active" ? "pulseAccent 2.2s ease-in-out infinite" : "none",
});

const assistantFlowConnectorStyle = (state: "done" | "active" | "pending"): React.CSSProperties => ({
  flex: "1 1 18px",
  height: 2,
  borderRadius: 999,
  background:
    state === "done"
      ? "linear-gradient(90deg, rgba(0, 212, 255, 0.85), rgba(107,56,212,0.65))"
      : state === "active"
        ? "linear-gradient(90deg, rgba(0, 212, 255, 0.45), rgba(255,255,255,0.12))"
        : "rgba(255,255,255,0.12)",
  opacity: state === "pending" ? 0.75 : 1,
});

const assistantActionMetaStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 10,
  color: "var(--text-secondary)",
  fontSize: 12,
};

const assistantFeedStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  maxHeight: 430,
  overflow: "auto",
  paddingRight: 4,
};

const assistantEmptyStyle: React.CSSProperties = {
  padding: "20px 18px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  border: "1px dashed rgba(255,255,255,0.08)",
  color: "var(--text-secondary)",
  fontSize: 14,
};

const assistantMessageStyle = (role: AssistantMessage["role"]): React.CSSProperties => ({
  padding: 18,
  borderRadius: 18,
  border: role === "assistant" ? "1px solid rgba(0, 212, 255, 0.16)" : "1px solid rgba(255,255,255,0.08)",
  background:
    role === "assistant"
      ? "linear-gradient(180deg, rgba(0, 212, 255, 0.06) 0%, rgba(0, 0, 0, 0.18) 100%)"
      : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
  boxShadow: role === "assistant" ? "0 12px 26px rgba(0, 0, 0, 0.18)" : "none",
});

const assistantMessageMetaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
  flexWrap: "wrap",
};

const assistantMessageRoleStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(0, 212, 255, 0.08)",
  color: "var(--accent-cyan)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
};

const assistantSummaryStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
};

const assistantMessageContentStyle = (_role: AssistantMessage["role"]): React.CSSProperties => ({
  color: "var(--text-primary)",
  fontSize: 15,
  lineHeight: 1.55,
  whiteSpace: "pre-wrap",
});

const assistantListBlockStyle: React.CSSProperties = {
  marginTop: 14,
};

const assistantListLabelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const assistantListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: "var(--text-primary)",
  display: "grid",
  gap: 6,
};

const assistantSourcesStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
};

const assistantSourceChipStyle: React.CSSProperties = {
  display: "inline-flex",
  padding: "5px 8px",
  borderRadius: 999,
  background: "rgba(0, 212, 255, 0.08)",
  border: "1px solid rgba(0, 212, 255, 0.14)",
  color: "var(--accent-cyan)",
  fontSize: 11,
};

const assistantPromptListStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
};

const assistantPromptButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-primary)",
  borderRadius: 999,
  padding: "7px 10px",
  fontSize: 12,
  cursor: "pointer",
};

const assistantSuggestionsStyle: React.CSSProperties = {
  marginTop: 18,
};

const assistantSuggestionsLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: 10,
};

const assistantSuggestionButtonsStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const assistantSuggestionButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(0, 212, 255, 0.14)",
  background: "rgba(0, 212, 255, 0.06)",
  color: "var(--text-primary)",
  borderRadius: 999,
  padding: "8px 11px",
  fontSize: 12,
  cursor: "pointer",
};

const assistantComposerStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 18,
};

const assistantInputStyle: React.CSSProperties = {
  width: "100%",
  resize: "vertical",
  minHeight: 92,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-primary)",
  padding: "14px 14px",
  fontSize: 14,
  lineHeight: 1.5,
  outline: "none",
};

const assistantSendButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "12px 16px",
  background: "linear-gradient(135deg, rgba(0, 212, 255, 0.92), rgba(0, 156, 255, 0.92))",
  color: "#041018",
  fontWeight: 700,
  cursor: "pointer",
  justifySelf: "flex-start",
};
