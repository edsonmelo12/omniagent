import * as React from "react";

export const PUBLIC_SIGNALS_PROVIDER_LABEL = "Brave Search";

type PublicSignalsBadgeProps = {
  sourceCount: number;
  queryCount: number;
  summary?: string | null;
  variant?: "pill" | "compact";
  providerLabel?: string;
};

export function PublicSignalsBadge({
  sourceCount,
  queryCount,
  summary,
  variant = "pill",
  providerLabel = PUBLIC_SIGNALS_PROVIDER_LABEL,
}: PublicSignalsBadgeProps) {
  const label = summary && summary.trim().length > 0 ? summary : `${providerLabel} não adicionou fontes neste ciclo`;
  const detail = `${sourceCount} fonte(s) em ${queryCount} consulta(s)`;

  if (variant === "compact") {
    return (
      <div style={compactStyle}>
        <span style={compactLabelStyle}>{label}</span>
        <span style={compactDetailStyle}>{detail}</span>
      </div>
    );
  }

  return (
    <span style={pillStyle}>
      <strong style={pillStrongStyle}>{providerLabel}</strong>
      <span>{sourceCount} fontes</span>
    </span>
  );
}

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(140, 200, 255, 0.22)",
  background: "rgba(140, 200, 255, 0.10)",
  color: "#d8e4ff",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
  whiteSpace: "nowrap",
};

const pillStrongStyle: React.CSSProperties = {
  color: "#8cc8ff",
  fontWeight: 700,
};

const compactStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(140, 200, 255, 0.18)",
  background: "rgba(140, 200, 255, 0.08)",
  padding: "14px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const compactLabelStyle: React.CSSProperties = {
  color: "#d8e4ff",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1.4,
};

const compactDetailStyle: React.CSSProperties = {
  color: "rgba(216, 228, 255, 0.7)",
  fontSize: 12,
  lineHeight: 1.4,
};
