interface DisplayModeToggleProps<T extends string | number> {
  label: string;
  value: T;
  options: Array<{
    label: string;
    value: T;
  }>;
  onChange: (value: T) => void;
}

export function DisplayModeToggle<T extends string | number>({ label, value, options, onChange }: DisplayModeToggleProps<T>) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        padding: "2px 0",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "inline-flex",
          gap: 8,
          padding: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={String(option.value)}
              type="button"
              style={{
                border: "none",
                borderRadius: 999,
                padding: "7px 12px",
                background: active
                  ? "linear-gradient(180deg, rgba(0, 212, 255, 0.22) 0%, rgba(0, 212, 255, 0.12) 100%)"
                  : "transparent",
                color: active ? "var(--accent-cyan)" : "rgba(255,255,255,0.72)",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
