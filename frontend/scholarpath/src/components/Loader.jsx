export default function Loader({ size = 40, center = false }) {
  return (
    <div style={center ? { display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 } : {}}>
      <div
        style={{
          width: size,
          height: size,
          border: "3px solid var(--border)",
          borderTopColor: "var(--green)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
