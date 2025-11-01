import React, { useMemo } from "react";
import { useTheme, alpha } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SummaryChart({ data = [], height = 180, title = "Calories" }) {
  const theme = useTheme();

  // Procesar datos para el gráfico
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .slice()
      .sort((a, b) => new Date(a.bucket) - new Date(b.bucket))
      .map(item => ({
        date: new Date(item.bucket).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit'
        }),
        calories: Math.round(item.calories || 0),
        fullDate: item.bucket
      }));
  }, [data]);

  // Calcular valores para los ejes
  const maxCalories = useMemo(() => {
    if (chartData.length === 0) return 500;
    const max = Math.max(...chartData.map(d => d.calories));
    return Math.ceil(max / 100) * 100 + 100; // Redondear hacia arriba al siguiente 100
  }, [chartData]);

  const yValues = useMemo(() => {
    const step = Math.max(50, Math.round(maxCalories / 6 / 50) * 50);
    const values = [];
    for (let i = maxCalories; i >= 0; i -= step) {
      values.push(i);
    }
    return values;
  }, [maxCalories]);

  if (chartData.length === 0) {
    return (
      <div
        style={{
          background: theme.palette.surfacePrimary.main,
          border: `1px solid ${theme.palette.outlineVariant.main}`,
          borderRadius: 14,
          padding: 18,
          height: height + 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: theme.palette.text.secondary, fontSize: 14 }}>
          No data available
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: theme.palette.surfacePrimary.main,
        border: `1px solid ${theme.palette.outlineVariant.main}`,
        borderRadius: 14,
        padding: 18,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{
          color: theme.palette.text.primary,
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 4
        }}>
          {title}
        </div>
        <div style={{
          color: theme.palette.text.secondary,
          fontSize: 12
        }}>
          Daily calorie intake over time
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={alpha(theme.palette.outline.main, 0.12)}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              domain={[0, maxCalories]}
              ticks={yValues}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.surfacePrimary.main,
                border: `1px solid ${theme.palette.outlineVariant.main}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: theme.palette.text.primary }}
              formatter={(value) => [`${value} cal`, 'Calories']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
