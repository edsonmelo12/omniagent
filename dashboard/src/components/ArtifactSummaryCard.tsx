interface ArtifactSummaryCardProps {
  title: string;
  subtitle: string;
  metrics: Array<{
    label: string;
    value: string | number;
  }>;
  bullets: string[];
  emptyBulletLabel?: string;
}

export function ArtifactSummaryCard({ title, subtitle, metrics, bullets, emptyBulletLabel = "Nenhum detalhe adicional disponível." }: ArtifactSummaryCardProps) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.18)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5, color: "var(--text-primary)" }}>{title}</div>
        <div style={{ fontSize: 11, lineHeight: 1.5, color: "var(--text-secondary)" }}>{subtitle}</div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
          gap: 8,
        }}
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              padding: 10,
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              display: "grid",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-secondary)" }}>{metric.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-cyan)" }}>{metric.value}</div>
          </div>
        ))}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {bullets.length > 0 ? (
          bullets.slice(0, 4).map((bullet, index) => (
            <li
              key={`${title}-${index}`}
              style={{
                position: "relative",
                paddingLeft: 14,
                fontSize: 12,
                lineHeight: 1.5,
                color: "var(--text-primary)",
              }}
            >
              {bullet}
            </li>
          ))
        ) : (
          <li
            style={{
              position: "relative",
              paddingLeft: 14,
              fontSize: 12,
              lineHeight: 1.5,
              color: "var(--text-secondary)",
            }}
          >
            {emptyBulletLabel}
          </li>
        )}
      </ul>
    </div>
  );
}
