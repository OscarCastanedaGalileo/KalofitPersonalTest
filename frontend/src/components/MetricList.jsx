import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';

export default function MetricList({ items }) {
  const theme = useTheme();

  return (
    <div style={{ marginTop: 12 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            background: theme.palette.surfacePrimary.main,
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <div style={{ color: theme.palette.text.secondary }}>{dayjs(it.date).format('MMM D, YYYY')}</div>
          <div style={{ color: theme.palette.text.primary, fontWeight: 600 }}>{it.value} kcal</div>
        </div>
      ))}
    </div>
  );
}
