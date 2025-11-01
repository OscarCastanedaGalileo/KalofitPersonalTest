import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button, TextField, IconButton, Modal, Grid } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete"; // <-- NUEVO: Icono de borrar
import { useNavigate } from "react-router";
import { backendClient } from "../api/backendClient";

const BASE = import.meta.env.VITE_API_BASE_URL; // (Nota: Ya no es necesario si usas backendClient para todo)
const QUICK_AMOUNTS = [250, 500, 750];
const DEFAULT_GOAL = 3000;

const LogWater = () => {
  const navigate = useNavigate();
  const [waterAmount, setWaterAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el Tracker y la Meta
  const [progress, setProgress] = useState(0);
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL);

  // ⭐️ ESTADO NUEVO: Para guardar los logs recientes de agua
  const [waterLogs, setWaterLogs] = useState([]);

  // Estados para el Modal de edición de meta
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(DEFAULT_GOAL);

  const buttonStyles = {
    backgroundColor: "#67E67C",
    color: "black",
    fontWeight: "bold",
    "&:hover": { backgroundColor: "#429d51" },
  };

  // ⭐️ FUNCIÓN NUEVA: Para obtener la lista de logs de agua
  const fetchWaterLogs = useCallback(async () => {
    try {
      // Usando la ruta GET /water de tu API
      const logs = await backendClient.get("/water");
      // Tu API devuelve todos los logs, los filtramos por los más recientes si es necesario,
      // o asumimos que la API ya los ordena. Mostraremos los 10 más recientes.
      setWaterLogs(logs.slice(0, 10));
    } catch (error) {
      console.error("Failed to fetch water logs:", error);
    }
  }, []); // Dependencia vacía si backendClient es estable

  const fetchWaterSummary = useCallback(async () => {
    try {
      const data = await backendClient.get("/water/summary/today");

      const consumed = data.totalConsumed || 0;
      const goal = data.dailyGoal || DEFAULT_GOAL;

      setTotalConsumed(consumed);
      setDailyGoal(goal);
      setNewGoal(goal); // Sincroniza el input del modal con la meta actual

      const calculatedProgress = Math.min(100, (consumed / goal) * 100);
      setProgress(calculatedProgress);
    } catch (error) {
      console.error("Failed to fetch water summary:", error);
    }
  }, []);

  // ⭐️ ACTUALIZACIÓN useEffect: Llamamos a ambas funciones
  useEffect(() => {
    fetchWaterSummary();
    fetchWaterLogs();
  }, [fetchWaterSummary, fetchWaterLogs]);

  const logWaterEntry = async (amountToLog) => {
    setIsLoading(true);
    const amount = parseFloat(amountToLog);

    if (isNaN(amount) || amount <= 0) {
      alert("Invalid water amount.");
      setIsLoading(false);
      return;
    }

    const logData = {
      amount: amount,
    };

    try {
      await backendClient.post("/water", logData);
      alert(`Successfully logged ${amountToLog} mL!`);
      setWaterAmount("");

      // ⭐️ ACTUALIZACIÓN: Refrescar logs y summary después de agregar
      fetchWaterSummary();
      fetchWaterLogs();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐️ FUNCIÓN NUEVA: Para eliminar un log de agua
  const deleteWaterLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this water entry?")) {
      return;
    }

    setIsLoading(true);
    try {
      // Llamada a la ruta DELETE /water/:id
      await backendClient.delete(`/water/${logId}`);
      alert("Water log deleted successfully!");

      // Refrescar el resumen y la lista después de borrar
      fetchWaterSummary();
      fetchWaterLogs();
    } catch (error) {
      console.error("Error deleting water log:", error);
      alert("Failed to delete water log.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logWaterEntry(waterAmount);
  };

  // ⭐️ CORRECCIÓN CLAVE: Usar backendClient.put en lugar de fetch
  const handleGoalSave = async () => {
    const goalValue = parseInt(newGoal);

    if (isNaN(goalValue) || goalValue < 100) {
      alert("Goal must be a number of at least 100 mL.");
      return;
    }

    setIsLoading(true);

    const goalData = {
      dailyWaterGoal: goalValue, // Usé 'dailyWaterGoal' asumiendo que es el campo de tu modelo Profile
    };

    try {
      // Usamos backendClient, asumiendo que la ruta es '/me/profile' o similar
      // Si tu backend tiene una ruta específica para metas, ajusta esto (ej: '/users/goal')
      await backendClient.put(`/me/profile`, goalData);

      setDailyGoal(goalValue);
      setIsModalOpen(false);
      fetchWaterSummary();
      alert(`Daily water goal successfully saved to ${goalValue} mL!`);
    } catch (error) {
      console.error("Goal submission error:", error);
      alert(`Error saving goal: ${error.message || "Server connection failed"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const progressText = `${Math.round(progress)}%`;

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#122B2A",
        minHeight: "100vh",
        color: "white",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      {/*  Optional: Botón de Settings */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, py: 1 }}>
        <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ color: "white" }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Log Water
        </Typography>
        <IconButton
          color="inherit"
          onClick={() => {
            setNewGoal(dailyGoal);
            setIsModalOpen(true);
          }}
          sx={{ color: "white" }}
        >
          {/* <SettingsIcon /> optional if we want this added to the water dashboard */}
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1C3837",
          borderRadius: 2,
          p: 3,
          mb: 4,
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Water Intake
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: "bold", color: "#67E67C" }}>
            {totalConsumed} / {dailyGoal} <span style={{ fontSize: "0.6em" }}>mL</span>
          </Typography>
          <Typography variant="subtitle2" color="white" sx={{ mt: 1 }}>
            {progress >= 100 ? "Goal achieved! 🎉" : `Target: ${dailyGoal} mL`}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 60,
            height: 150,
            borderRadius: "30px",
            backgroundColor: "#4A4A4A",
            position: "relative",
            overflow: "hidden",
            border: "2px solid #e691670",
          }}
        >
          {/* Water Capsule */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${progress}%`,
              transition: "height 0.5s ease-in-out",
              background: "linear-gradient(to top, #007bff, #3fa0ff)",
            }}
          />
          <Typography
            sx={{
              position: "absolute",
              bottom: 10,
              width: "100%",
              textAlign: "center",
              fontWeight: "bold",
              color: progress > 10 ? "white" : "#ccc",
              zIndex: 1,
              
            }}
          >
            {progressText}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        Quick Log
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {QUICK_AMOUNTS.map((amount) => (
          // Grid item to wrap the button and use spacing correctly
          <Grid item xs={4} key={amount}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => logWaterEntry(amount)}
              disabled={isLoading}
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

      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        Manual Log
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 1.5,
          mb: 4,
        }}
      >
        <TextField
          label="Water Amount (mL)"
          variant="outlined"
          type="number"
          value={waterAmount}
          onChange={(e) => setWaterAmount(e.target.value)}
          required
          sx={{
            flexGrow: 1,
            "& .MuiOutlinedInput-root": { backgroundColor: "#122B2A", color: "white", "& fieldset": { borderColor: "#AAA" }, "&:hover fieldset": { borderColor: "#777" } },
            "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#67E67C !important" },
          }}
          InputLabelProps={{ sx: { color: "#aaa" } }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{
            ...buttonStyles,
            flexShrink: 0,
            whiteSpace: "nowrap",
            px: 3,
          }}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Log Manually"}
        </Button>
      </Box>

      <Box sx={{ mt: 5, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Recent Logs ({waterLogs.length})
        </Typography>

        {waterLogs.length === 0 ? (
          <Typography variant="subtitle1" color="#aaa" sx={{ textAlign: "center", py: 2 }}>
            No water logs have been registered yet.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 300, overflowY: "auto", p: 0.5 }}>
            {waterLogs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1.5,
                  backgroundColor: "#1C3837",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "#67E67C" }}>
                    {log.mililiters} mL
                  </Typography>
                  <Typography variant="caption" color="#ccc">
                    {new Date(log.consumedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => deleteWaterLog(log.id)}
                  disabled={isLoading}
                  size="small"
                  sx={{ color: "#ff6961" }} // Soft red for trashcan
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} aria-labelledby="goal-modal-title">
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "#122B2A",
            border: "2px solid #67E67C",
            p: 4,
            boxShadow: 24,
            borderRadius: 2,
            color: "white",
          }}
        >
          <Typography id="goal-modal-title" variant="h6" component="h2" mb={2}>
            Set Daily Water Target (mL)
          </Typography>
          <TextField
            label="New Target (mL)"
            type="number"
            fullWidth
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            InputLabelProps={{ sx: { color: "#aaa" } }}
            sx={{
              "& .MuiOutlinedInput-root": { color: "white", "& fieldset": { borderColor: "#AAA" } },
              "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#67E67C !important" },
            }}
          />
          <Button onClick={handleGoalSave} fullWidth variant="contained" sx={{ ...buttonStyles, mt: 3 }} disabled={isLoading}>
            Save Target
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default LogWater;
