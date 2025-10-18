export default function FoodList({ items = [], loading, error }) {
  if (loading) return <p style={{ color: "#8BA7A7" }}>Buscando...</p>;
  if (error) return <p style={{ color: "#FE7B72" }}>Error: {error}</p>;
  if (!items.length) return <p style={{ color: "#8BA7A7" }}>Sin resultados</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
      {items.map((f) => (
        <li key={f.fdc_id || f.id} style={{ padding: 12, border: "1px solid #1e2d2d", borderRadius: 8, marginBottom: 8 }}>
          <div style={{ fontWeight: 600, color: "#67E67C" }}>{f.name}</div>
          <div style={{ fontSize: 13, color: "#8BA7A7" }}>
            kcal/100g: {f.kcal_per_100g ?? "N/D"} · FDC id: {f.fdc_id ?? "-"}
          </div>
        </li>
      ))}
    </ul>
  );
}
