export default function CompletionBar({ value = 0, label = "", showLabel = true }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
          <span style={{ color: "var(--text-muted)" }}>{label}</span>
          <span style={{ fontWeight: 700 }}>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct >= 80 ? "var(--green)" : pct >= 50 ? "#ff9800" : "#ef5350",
            borderRadius: 4,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
