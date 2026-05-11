import { useEffect, useState } from "react";
import { useSquadStore } from "@/store/useSquadStore";
import { formatElapsed } from "@/lib/formatTime";
import { ptBR } from "@/i18n/pt-BR";

export function StatusBar() {
  const selectedSquad = useSquadStore((s) => s.selectedSquad);
  const state = useSquadStore((s) =>
    s.selectedSquad ? s.activeStates.get(s.selectedSquad) : undefined
  );
  const isConnected = useSquadStore((s) => s.isConnected);

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!state?.startedAt) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(state.startedAt).getTime();
    const tick = () => setElapsed(Date.now() - startTime);
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state?.startedAt]);

  if (!selectedSquad || !state) {
    return (
      <footer style={footerStyle}>
        <span style={footerHintStyle}>{ptBR.statusBar.empty}</span>
        <ConnectionDot connected={isConnected} />
      </footer>
    );
  }

  return (
    <footer style={footerStyle}>
      <div style={statusClusterStyle}>
        <span style={statusPillStyle}>
          {ptBR.statusBar.step} {state.step.current}/{state.step.total}
        </span>
        {state.step.label && <span style={footerHintStyle}>{state.step.label}</span>}
        {state.startedAt && <span style={footerHintStyle}>{formatElapsed(elapsed)}</span>}
        {state.handoff && (
          <span
            style={handoffStyle}
            title={`${state.handoff.from} → ${state.handoff.to}: ${state.handoff.message}`}
          >
            {state.handoff.from} → {state.handoff.to}: {state.handoff.message}
          </span>
        )}
      </div>
      <ConnectionDot connected={isConnected} />
    </footer>
  );
}

function ConnectionDot({ connected }: { connected: boolean }) {
  return (
    <span
      title={connected ? ptBR.statusBar.connected : ptBR.statusBar.disconnected}
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: connected ? "var(--accent-green)" : "var(--accent-red)",
        flexShrink: 0,
      }}
    />
  );
}

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "8px 16px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  background:
    "linear-gradient(180deg, rgba(16,16,24,0.94) 0%, rgba(18,18,28,0.98) 100%)",
  fontSize: 13,
  height: 40,
  minHeight: 40,
};

const statusClusterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flex: 1,
  minWidth: 0,
};

const statusPillStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(0, 212, 255, 0.22)",
  background: "rgba(0, 212, 255, 0.08)",
  color: "var(--text-primary)",
  fontSize: 12,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const footerHintStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: 12,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const handoffStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: "var(--text-secondary)",
  fontSize: 12,
};
