import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { useTheme, alpha } from '@mui/material/styles';

const ScatterChartComponent = ({ data }) => {
  const theme = useTheme();
  return (
      <Card
        sx={{
          bgcolor: theme.palette.surfacePrimary.main,
          color: theme.palette.text.primary,
          width: '100%',
          borderRadius: 4,
          boxShadow: `0px 2px 10px ${alpha(theme.palette.common.black, 0.18)}`,
        }}
      >
        <CardContent>
          <Typography
            variant="h1"
            sx={{ mb: 2, fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>
            Last Week
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ opacity: 0.7, mb: 1, fontSize: 14, }}
          >
            Calories
          </Typography>

          <ResponsiveContainer width="100%" height={220} >
            <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10,  }}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.outline.main, 0.5)} />
              <XAxis
                dataKey="x"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
              />
              <YAxis
                dataKey="y"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.surfacePrimary.main,
                  border: 'none',
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                }}
              />
              <Scatter
                name="CaloriasWeek"
                data={data}
                fill={theme.palette.lightGreen.main}
                line={{ stroke: theme.palette.lightGreen.main, strokeWidth: 2 }}
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
  );
};

export default ScatterChartComponent;
