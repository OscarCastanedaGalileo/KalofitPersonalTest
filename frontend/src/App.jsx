import { useState, useEffect, useCallback } from "react";
import {
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Menu,
  MenuItem,
  Box,
  Typography,
  AppBar,
  Avatar,
  Badge,
  Card,
  CardContent,
  Divider,
  IconButton,
  Paper,
  Slider,
  Stack,
  ThemeProvider,
  Grid,
  Chip,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Fab,
} from "@mui/material";
import FoodsSearch from "./pages/FoodsSearch";
import CalorieCalculator from '../components/CalorieCalculator';
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import StarIcon from "@mui/icons-material/Star";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
// Asegúrate de que este path sea correcto
import { ColorModeContext } from './context/ColorModeContext.jsx';
import { useTheme, alpha } from "@mui/material/styles"; // Importar useTheme y alpha para acceder al modo y crear transparencias
import { backendClient } from "./api/backendClient.js";
import UserAvatar from "./components/UserAvatar";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
import { useNavigate } from 'react-router';
import ConsumptionTypeModal from './components/ConsumptionTypeModal';


const QUICK_AMOUNTS = [250, 500, 750];


function Donut({ size = 200, value = 50, track = "#5d7a78", bar = "#ffd166", children }) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          opacity={0.4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={bar}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ position: "absolute", inset: 0 }}
        spacing={0.5}
      >
        {children}
      </Stack>
    </Box>
  );
}
function App() {
  // Obtener el tema actual para leer el modo
  const theme = useTheme();
  const navigate = useNavigate();
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);

  const [water, setWater] = useState(1.9); // litros
  const [progressWater, setProgressWater] = useState(0);
  const [totalConsumedWater, setTotalConsumedWater] = useState(0);
  const [dailyGoalWater, setDailyGoalWater] = useState(0);
  const [lastConsumedAt, setLastConsumedAt] = useState(null);

  // Estado para calorías
  const [totalConsumedCalories, setTotalConsumedCalories] = useState(0);
  const [dailyGoalCalories, setDailyGoalCalories] = useState(0);

  // Estado para comidas del día
  const [todayMeals, setTodayMeals] = useState([]);

  // Handlers para el modal de consumo
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
  const calories = totalConsumedCalories.toFixed(2);
  const caloriesGoal = dailyGoalCalories;
  const caloriesPct = Math.round((calories / caloriesGoal) * 100);

  const fetchWaterSummary = useCallback(async () => {
    try {

      const data = await backendClient.get('/water/summary/today');

      const consumed = data.totalConsumed || 0;
      const goal = data.dailyGoal;
      const lastConsumed = data.lastConsumedAt;

      setTotalConsumedWater(consumed);
      setDailyGoalWater(goal);
      setLastConsumedAt(lastConsumed);

      const calculatedProgress = Math.min(100, (consumed / goal) * 100);
      setProgressWater(calculatedProgress);
    } catch (error) {
      console.error("Failed to fetch water summary:", error);
    }
  }, [])

  const fetchCaloriesSummary = useCallback(async () => {
    try {
      const data = await backendClient.get('/api/foodlogs/summary/today');

      const consumed = data.totalConsumed || 0;
      const goal = data.dailyGoal;

      setTotalConsumedCalories(consumed);
      setDailyGoalCalories(goal);
    } catch (error) {
      console.error("Failed to fetch calories summary:", error);
    }
  }, [])

  const fetchTodayMeals = useCallback(async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const data = await backendClient.get(`/api/foodlogs/date/detailed?date=${today}`);
      setTodayMeals(data.entries || []);
    } catch (error) {
      console.error("Failed to fetch today's meals:", error);
      setTodayMeals([]);
    }
  }, [])

  useEffect(() => {
    fetchWaterSummary();
    fetchCaloriesSummary();
    fetchTodayMeals();
  }, [fetchWaterSummary, fetchCaloriesSummary, fetchTodayMeals]);
  const logWaterEntry = async (amountToLog) => {
    const amount = parseFloat(amountToLog);

    if (isNaN(amount) || amount <= 0) {
      alert("Invalid water amount.");
      return;
    }

    const logData = {
      amount: amount,
    };

    try {
      await backendClient.post('/water', logData)
      alert(`Successfully logged ${amountToLog} mL!`);
      fetchWaterSummary();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Server connection failed.");
    }
  };
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 2 }}>
      <Box
        sx={{
          mx: "auto",
          borderRadius: 3,
          overflow: "hidden",
          // bgcolor: "#0d1f1e",
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
              <Chip
                size="small"
                icon={<CalendarMonthRoundedIcon fontSize="small" />}
                label="Today"
                sx={{
                  bgcolor: "background.default",
                  color: "text.primary"
                }}
              />
              <IconButton size="small">
                <Badge variant="dot" color="primary">
                  <div style={{ width: 8, height: 8 }} />
                </Badge>
              </IconButton>
            </Stack>
          </Stack>
        </AppBar>
        <Box sx={{ px: 2, pb: 9 }}>
          {/* Monthly progress title + star */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <Box sx={{
              flex: 1,
              height: 4,
              bgcolor: "outline.main",
              borderRadius: 99
            }} />
            <Tooltip title="Monthly progress">
              <StarIcon sx={{ color: "secondary.main" }} />
            </Tooltip>
          </Stack>
          <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center", color: "text.secondary" }}>
            MONTHLY PROGRESS
          </Typography>

          {/* Big calories donut */}
          <Stack alignItems="center" sx={{ mt: 1.5 }}>
            <Donut size={180} value={caloriesPct} track={theme.palette.donutTrack.main} bar={theme.palette.donutBar.main}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>CALORIES</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{calories}/{caloriesGoal}</Typography>
            </Donut>
          </Stack>
          {/* Water card */}
          <Stack direction="row" spacing={1} alignItems="center">
            <WaterDropRoundedIcon />
            <Typography variant="subtitle1">Water Intake</Typography>
          </Stack>
          <Card sx={{ mt: 2.5, bgcolor: "surfacePrimary.main", borderRadius: 4 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Water
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {totalConsumedWater.toFixed(1)} / {dailyGoalWater}L
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  {/* Botones circulares
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 0.8,
                      borderRadius: 3,
                      bgcolor: "transparent",
                      borderColor: (t) => t.palette.buttonBorder.main,
                    }}
                  >
                    <Stack direction="column" alignItems="center" spacing={1.5}>
                      <IconButton
                        aria-label="sumar agua"
                        size="small"
                        onClick={() => setWater(+(water + 0.1).toFixed(1))}
                        sx={(t) => ({
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: `2px solid ${t.palette.buttonBorder.main}`,
                          bgcolor: "transparent",
                          "&:hover": { bgcolor: alpha(t.palette.primary.main, 0.1), borderColor: t.palette.primary.main },
                        })}
                      >
                        <AddRoundedIcon />
                      </IconButton>

                      <IconButton
                        aria-label="restar agua"
                        size="small"
                        onClick={() => setWater(Math.max(0, +(water - 0.1).toFixed(1)))}
                        sx={(t) => ({
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: `2px solid ${t.palette.buttonBorder.main}`,
                          bgcolor: "transparent",
                          "&:hover": { bgcolor: alpha(t.palette.primary.main, 0.1), borderColor: t.palette.primary.main },
                        })}
                      >
                        <RemoveRoundedIcon />
                      </IconButton>
                    </Stack>
                  </Paper> */}

                  {/* Contenedor del agua */}
                  <Box
                    sx={{
                      width: 60,
                      height: 150,
                      borderRadius: "30px",
                      backgroundColor: (t) => t.palette.waterContainerBg.main,
                      position: "relative",
                      overflow: "hidden",
                      // border: (t) => `2px solid ${t.palette.primary.main}`,
                    }}
                  >
                    {/* El Agua */}
                    <Box
                      onClick={() => navigate('/water')}
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        width: "100%",
                        // border: "none",
                        // onClick: () => navigate('/water'),
                        cursor: "pointer",
                        transition: "height 0.5s ease-in-out",
                        height: `${progressWater}%`,
                        background: (t) => `linear-gradient(to top, ${t.palette.waterGradientStart.main}, ${t.palette.waterGradientEnd.main})`,
                      }}
                    />
                    <Typography
                      sx={{
                        position: "absolute",
                        bottom: 10,
                        width: "100%",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: 10,
                        color: progressWater > 10 ? 'common.white' : 'text.secondary',
                        zIndex: 1,
                      }}
                    >
                      {`${progressWater.toFixed(1)}%`}
                    </Typography>
                  </Box>
                </Stack>

              </Stack>
              <Grid container spacing={1} sx={{
                mt: 2
              }} >
                {QUICK_AMOUNTS.map((amount) => (
                  <Grid key={amount}>
                    <Button
                      variant="outlined"
                      onClick={() => logWaterEntry(amount)}
                      // disabled={isLoading}
                      sx={{
                        color: "#67E67C",
                        borderColor: "#67E67C",
                        "&:hover": { borderColor: "#429d51", backgroundColor: "rgba(103, 230, 124, 0.1)" },
                      }}
                    >
                      {amount} mL
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "inline-flex", alignItems: "center", mt: 1.5 }}>
                {lastConsumedAt ? `Last time ${dayjs(lastConsumedAt).format('h:mm A')}` : 'No water logged yet'}
              </Typography>
            </CardContent>
          </Card>

          {/* Meals section */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3 }}>
            <RestaurantRoundedIcon />
            <Typography variant="subtitle1">Meals</Typography>
            <IconButton
              size="small"
              onClick={handleConsumptionModalOpen}
              sx={{
                color: '#67E67C',
                '&:hover': {
                  bgcolor: 'rgba(103, 230, 124, 0.1)',
                }
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </Stack>
          <ConsumptionTypeModal
            open={isConsumptionModalOpen}
            onClose={handleConsumptionModalClose}
            onFoodSelect={handleFoodConsumption}
            onRecipeSelect={handleRecipeConsumption}
          />
          <Card sx={{ mt: 2.5, bgcolor: "background.default" }}>
            <CardContent sx={{bgcolor: "background.default", p: 0}}>
              {todayMeals.length === 0 ? (
                <Typography variant="body2" sx={{ color: "background.paper", textAlign: "center", py: 2 }}>
                  No meals logged today
                </Typography>
              ) : (
                <List sx={{ py: 0, px: 0 }}>
                  {todayMeals.map((meal, index) => (
                    <ListItem
                      key={meal.id || index}
                      sx={{
                        px: 2,
                        py: 2,
                        mb: 1,
                        borderRadius: 2,
                        bgcolor: "surfacePrimary.main",
                        // border: "1px solid"
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {meal.food?.name || meal.recipe?.name || 'Unknown food'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#67E67C", fontWeight: 700, fontSize: '0.9rem' }}>
                              {Number(meal.totalCalories  ?? 0).toFixed(2)} cal
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box>
                            {meal.tags && meal.tags.length > 0 && (
                              <Box sx={{ mb: 0.5 }}>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                  {meal.tags.slice(0, 3).map((tag) => (
                                    <Chip
                                      key={tag.id}
                                      label={tag.name}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.7rem',
                                        '& .MuiChip-label': { px: 0.5 }
                                      }}
                                    />
                                  ))}
                                  {meal.tags.length > 3 && (
                                    <Typography variant="caption" sx={{ color: "text.secondary", alignSelf: 'center' }}>
                                      +{meal.tags.length - 3}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            )}
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {dayjs(meal.consumedAt).format('h:mm A')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

        </Box>
      </Box>
    </Box>
  );
}

export default App;
