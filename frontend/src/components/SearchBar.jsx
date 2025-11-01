import { useEffect, useRef, useState } from "react";
import { useTheme } from '@mui/material/styles';

export default function SearchBar({ onSearch, placeholder = "Buscar alimento..." }) {
  const [q, setQ] = useState("");
  const t = useRef(null);
  const theme = useTheme();

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
      style={{
        padding: 12,
        width: '100%',
        borderRadius: 8,
        border: `1px solid ${theme.palette.outlineVariant.main}`,
        background: theme.palette.surfacePrimary.main,
        color: theme.palette.text.primary,
      }}
    />
  );
}
