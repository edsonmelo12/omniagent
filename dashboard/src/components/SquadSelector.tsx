import { useSquadStore } from "@/store/useSquadStore";
import { SquadCard } from "./SquadCard";
import { ptBR } from "@/i18n/pt-BR";

export function SquadSelector() {
  const squads = useSquadStore((s) => s.squads);
  const activeStates = useSquadStore((s) => s.activeStates);
  const selectedSquad = useSquadStore((s) => s.selectedSquad);
  const selectSquad = useSquadStore((s) => s.selectSquad);
  const isConnected = useSquadStore((s) => s.isConnected);

  // Sort: active squads first, then alphabetical
  const squadList = Array.from(squads.values()).sort((a, b) => {
    const aActive = activeStates.has(a.code) ? 0 : 1;
    const bActive = activeStates.has(b.code) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.name.localeCompare(b.name);
  });

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100%",
        background:
          "linear-gradient(180deg, rgba(16, 16, 28, 0.98) 0%, rgba(19, 19, 31, 0.98) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div style={headerStyle}>
        <div style={eyebrowStyle}>{ptBR.squads.eyebrow}</div>
        <div style={panelTitleStyle}>{ptBR.squads.title}</div>
        <div style={panelSubtitleStyle}>{ptBR.squads.subtitle(activeStates.size, squadList.length, isConnected)}</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {squadList.length === 0 && (
          <div style={{ padding: "16px 12px", color: "var(--text-secondary)", fontSize: 12 }}>
            {ptBR.squads.empty}
          </div>
        )}
        {squadList.map((squad) => (
          <SquadCard
            key={squad.code}
            squad={squad}
            state={activeStates.get(squad.code)}
            isSelected={selectedSquad === squad.code}
            onSelect={() => selectSquad(squad.code)}
          />
        ))}
      </div>
    </aside>
  );
}

const headerStyle: React.CSSProperties = {
  padding: "16px 12px 10px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 1.1,
  color: "var(--text-secondary)",
};

const panelTitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 16,
  fontWeight: 800,
  color: "var(--text-primary)",
};

const panelSubtitleStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 1.45,
  color: "var(--text-secondary)",
};
