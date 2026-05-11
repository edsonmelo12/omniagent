import * as React from "react";

type LoadingPanelProps = {
  label: string;
  hint?: string;
  variant?: "panel" | "compact";
};

export function LoadingPanel({
  label,
  hint = "Aguarde alguns segundos enquanto o painel carrega os dados persistidos.",
  variant = "panel",
}: LoadingPanelProps) {
  if (variant === "compact") {
    return <div style={compactStyle}>{label}</div>;
  }

  return (
    <div style={panelStyle}>
      <div style={pulseStyle} />
      <div style={labelStyle}>{label}</div>
      <div style={hintStyle}>{hint}</div>
    </div>
  );
}

const panelStyle: React.CSSProperties = {
  minHeight: 160,
  borderRadius: 24,
  border: "1px solid rgba(110, 124, 156, 0.14)",
  background: "linear-gradient(180deg, rgba(9, 14, 24, 0.75), rgba(12, 17, 28, 0.92))",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 12,
  padding: 24,
  textAlign: "center",
  color: "#d8e4ff",
};

const pulseStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: "50%",
  border: "3px solid rgba(216, 228, 255, 0.25)",
  borderTopColor: "#8cc8ff",
  animation: "spin 1s linear infinite",
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: "0.02em",
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: "rgba(216, 228, 255, 0.68)",
  maxWidth: 360,
};

const compactStyle: React.CSSProperties = {
  minHeight: 92,
  borderRadius: 18,
  border: "1px solid rgba(110, 124, 156, 0.14)",
  background: "rgba(12, 17, 28, 0.72)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  textAlign: "center",
  color: "#d8e4ff",
  fontSize: 13,
  fontWeight: 600,
};
