import { useEffect, useRef, useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Buscar alimento..." }) {
  const [q, setQ] = useState("");
  const t = useRef(null);

  useEffect(() => {
    // limpiar cualquier timeout previo
    if (t.current) clearTimeout(t.current);

    if (!q) {
      // NO hacer "return onSearch('')"  ❌
      onSearch("");      // solo ejecuta, sin retornar
      return;            // termina el efecto sin cleanup adicional
    }

    t.current = setTimeout(() => onSearch(q), 350);

    // cleanup VÁLIDO: siempre devolver una función
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, [q, onSearch]);

  return (
    <input
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder={placeholder}
      style={{ padding: 12, width: "100%", borderRadius: 8, border: "1px solid #2A3A3A",
               background: "#0f1f1f", color: "#e5ffe5" }}
    />
  );
}
