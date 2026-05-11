import * as React from "react";

type EmptyStatePanelProps = {
  title: string;
  body: string;
};

export function EmptyStatePanel({ title, body }: EmptyStatePanelProps) {
  return (
    <div style={emptyStyle}>
      <div style={titleStyle}>{title}</div>
      <div style={bodyStyle}>{body}</div>
    </div>
  );
}

const emptyStyle: React.CSSProperties = {
  minHeight: 140,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  display: "grid",
  alignContent: "center",
  justifyItems: "center",
  gap: 8,
  padding: 20,
  textAlign: "center",
};

const titleStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--text-primary)",
};

const bodyStyle: React.CSSProperties = {
  maxWidth: 360,
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--text-secondary)",
};
