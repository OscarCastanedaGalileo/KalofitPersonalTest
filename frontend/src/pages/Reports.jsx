import { useEffect, useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import SummaryChart from "../components/SummaryChart";
import { getAggregate, getDateTotals } from "../api";
import UserAvatar from "../components/UserAvatar";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router";
import ConsumptionTypeModal from '../components/ConsumptionTypeModal';

// 🟢 Importar la ventana modal de notificaciones
import NotificationsPage from "./NotificationsPage";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [period] = useState("day");
  const [range, setRange] = useState("30d");
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [from, setFrom] = useState(dayjs().subtract(30, "day").startOf("day").toISOString());
  const [to, setTo] = useState(dayjs().endOf("day").add(1, "millisecond").toISOString());

  const [chartData, setChartData] = useState([]);
  const [dailyTotals, setDailyTotals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🟢 Estado para abrir/cerrar el modal de notificaciones
  const [openNotifications, setOpenNotifications] = useState(false);

  // rangos predeterminados
  const computeRangeDates = useCallback((value) => {
    const now = dayjs();
    const endOfToday = now.endOf("day").add(1, "millisecond").toISOString();

    switch (value) {
      case "beginning":
        return {
          from: now.subtract(3, "year").startOf("year").toISOString(),
          to: endOfToday,
        };
      case "year":
        return {
          from: now.startOf("year").toISOString(),
          to: now.endOf("year").add(1, "millisecond").toISOString(),
        };
      case "30d":
        return {
          from: now.subtract(30, "day").startOf("day").toISOString(),
          to: endOfToday,
        };
      case "7d":
        return {
          from: now.subtract(7, "day").startOf("day").toISOString(),
          to: endOfToday,
        };
      default:
        return {
          from: now.subtract(30, "day").startOf("day").toISOString(),
          to: endOfToday,
        };
    }
  }, []);

  const applyRange = useCallback((value) => {
    setRange(value);
    const { from: newFrom, to: newTo } = computeRangeDates(value);
    setFrom(newFrom);
    setTo(newTo);
  }, [computeRangeDates]);

  // Cargar datos del gráfico
  const loadChartData = useCallback(async () => {
    try {
      const res = await getAggregate({ period, from, to });
      setChartData(res.buckets || []);
    } catch (e) {
      console.error("Error loading chart data:", e);
      setChartData([]);
    }
  }, [period, from, to]);

  // Cargar totales diarios
  const loadDailyTotals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDateTotals({ limit: 30 });
      setDailyTotals(res || []);
    } catch (e) {
      console.error("Error loading daily totals:", e);
      setDailyTotals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChartData();
  }, [loadChartData]);

  useEffect(() => {
    loadDailyTotals();
  }, [loadDailyTotals]);

  // Calcular promedio de 7 días
  const sevenDayAverage = useMemo(() => {
    if (dailyTotals.length === 0) return 0;

    const last7Days = dailyTotals.slice(0, 7);
    const total = last7Days.reduce((sum, day) => sum + (Number(day?.totalCalories ?? 0)), 0);
    return Math.round(total / last7Days.length);
  }, [dailyTotals]);

  const handleDayClick = (date) => {
    // Navegar a la página de detalles del día
    navigate(`/day-details/${date}`);
  };

  const handleConsumptionModalOpen = () => {
    setIsConsumptionModalOpen(true);
  };

  const handleConsumptionModalClose = () => {
    setIsConsumptionModalOpen(false);
  };

  const handleFoodConsumption = () => {
    setIsConsumptionModalOpen(false);
    navigate('/food-consumption/new');
  };

  const handleRecipeConsumption = () => {
    setIsConsumptionModalOpen(false);
    navigate('/recipe-consumption/new');
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default', p: 2 }}>
      <Box
        sx={{
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}>
        <AppBar position="static"
          elevation={0}
          sx={{
            bgcolor: "transparent",
            p: 1.2, px: 1.5
          }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <UserAvatar />
            <Stack direction="row" spacing={1} alignItems="center">
              
              {/* 🟢 Abrir el modal de notificaciones */}
              <IconButton size="small" onClick={() => setOpenNotifications(true)}>
                <Badge variant="dot" color="primary">
                  <NotificationsIcon fontSize="small"/>
                </Badge>
              </IconButton>

            </Stack>
          </Stack>
        </AppBar>
        <Box sx={{ px: 2, pb: 9, maxWidth: 1100, mx: 'auto' }}>

          {/* Estadística de promedio 7 días */}
          <Box sx={{ mb: 3, mt: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average of the last 7 days
                  </Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {sevenDayAverage} cal
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Selector de rango y gráfico */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Calories History
            </Typography>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select value={range} onChange={(e) => applyRange(e.target.value)}>
                <MenuItem value="beginning">From the Beginning</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <SummaryChart data={chartData} title="Daily Calories" />

          {/* Lista por día */}
          <Box component="section" sx={{ mt: 3 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/food-units')}
              sx={{
                mb: 2,
                maxWidth: 400,
                mx: 'auto',
                display: 'block',
                bgcolor: '#67E67C',
                '&:hover': {
                  bgcolor: '#429d51',
                }
              }}
            >
              Food Units Managment
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                Calories by Day
              </Typography>
              <Tooltip title="Add Consumption">
                <IconButton size="small" color="primary" onClick={handleConsumptionModalOpen}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <ConsumptionTypeModal
                open={isConsumptionModalOpen}
                onClose={handleConsumptionModalClose}
                onFoodSelect={handleFoodConsumption}
                onRecipeSelect={handleRecipeConsumption}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                <CircularProgress size={18} />
                <Typography variant="body2">Loading...</Typography>
              </Box>
            ) : dailyTotals.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', p: 2 }}>
                No data available.
              </Typography>
            ) : (
              <List>
                {dailyTotals.map((day) => {
                  const date = dayjs(day.date);
                  const isToday = date.isSame(dayjs(), 'day');
                  const isYesterday = date.isSame(dayjs().subtract(1, 'day'), 'day');

                  let dateLabel = date.format('MMM DD, YYYY');
                  if (isToday) dateLabel = 'Today';
                  else if (isYesterday) dateLabel = 'Yesterday';

                  const calories = Math.round(day.totalCalories || 0);
                  const entries = day.entryCount || 0;

                  return (
                    <ListItem
                      key={day.date}
                      button
                      onClick={() => handleDayClick(day.date)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight={isToday ? 'bold' : 'normal'}>
                              {dateLabel}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={`${entries} Log${entries !== 1 ? 's' : ''}`}
                                size="small"
                                variant="outlined"
                              />
                              <Typography variant="body1" color="primary" fontWeight="bold">
                                {calories} cal
                              </Typography>
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {date.format('dddd')}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Box>
      </Box>

      {/* 🟣 Modal de notificaciones con fondo oscuro y blur */}
      <NotificationsPage
        open={openNotifications}
        onClose={() => setOpenNotifications(false)}
      />
    </Box>
  );
}
