import * as React from "react";

type EmptyStateNoticeProps = {
  message: string;
  variant?: "panel" | "compact";
};

export function EmptyStateNotice({ message, variant = "panel" }: EmptyStateNoticeProps) {
  return <div style={variant === "compact" ? compactStyle : panelStyle}>{message}</div>;
}

const panelStyle: React.CSSProperties = {
  minHeight: 92,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  textAlign: "center",
  color: "var(--text-secondary)",
  fontSize: 13,
  lineHeight: 1.5,
};

const compactStyle: React.CSSProperties = {
  minHeight: 92,
  borderRadius: 18,
  border: "1px dashed rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
  textAlign: "center",
  color: "var(--text-secondary)",
  fontSize: 13,
  lineHeight: 1.5,
};
