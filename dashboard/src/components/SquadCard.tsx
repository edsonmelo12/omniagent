import type { SquadInfo, SquadState } from "@/types/state";
import { StatusBadge } from "./StatusBadge";

interface SquadCardProps {
  squad: SquadInfo;
  state: SquadState | undefined;
  isSelected: boolean;
  onSelect: () => void;
}

export function SquadCard({ squad, state, isSelected, onSelect }: SquadCardProps) {
  const isActive = !!state;
  const status = state?.status ?? "inactive";

  return (
    <button
      onClick={onSelect}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "11px 12px",
        border: "1px solid",
        borderColor: isSelected ? "rgba(0, 212, 255, 0.32)" : "rgba(255,255,255,0.06)",
        borderRadius: 14,
        background: isSelected
          ? "linear-gradient(180deg, rgba(0, 212, 255, 0.16) 0%, rgba(255,255,255,0.03) 100%)"
          : "rgba(255,255,255,0.02)",
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontFamily: "inherit",
        boxShadow: isSelected ? "0 12px 24px rgba(0,0,0,0.22)" : "none",
        transition: "transform 0.16s ease, border-color 0.16s ease, background 0.16s ease, box-shadow 0.16s ease",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <StatusBadge status={status} />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ marginRight: 2, fontSize: 14 }}>{squad.icon}</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: isSelected ? 700 : 600,
            }}
          >
            {squad.name}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            color: "var(--text-secondary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {squad.description}
        </div>
      </div>
      {state?.step && (
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700 }}>
          {state.step.current}/{state.step.total}
        </span>
      )}
    </button>
  );
}
