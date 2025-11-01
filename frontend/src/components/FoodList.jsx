import React from 'react';
import { useTheme } from '@mui/material/styles';

export default function FoodList({ items = [], loading, error }) {
  const theme = useTheme();

  if (loading) return <p style={{ color: theme.palette.text.secondary }}>Buscando...</p>;
  if (error) return <p style={{ color: theme.palette.danger.main }}>Error: {error}</p>;
  if (!items.length) return <p style={{ color: theme.palette.text.secondary }}>Sin resultados</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
      {items.map((f) => (
        <li
          key={f.fdc_id || f.id}
          style={{
            padding: 12,
            border: `1px solid ${theme.palette.outlineVariant.main}`,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <div style={{ fontWeight: 600, color: theme.palette.primary.main }}>{f.name}</div>
          <div style={{ fontSize: 13, color: theme.palette.text.secondary }}>
            kcal/100g: {f.kcal_per_100g ?? 'N/D'} · FDC id: {f.fdc_id ?? '-'}
          </div>
        </li>
      ))}
    </ul>
  );
}
