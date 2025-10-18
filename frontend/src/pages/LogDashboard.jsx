import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router"; //

export function LogDashboard() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 3,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Log Dashboard
      </Typography>

      <Button variant="contained" fullWidth onClick={() => navigate("/log/register-food")}>
        Register Food
      </Button>

      <Button variant="contained" fullWidth onClick={() => navigate("/log/foods-list")}>
        Foods List
      </Button>

      {/* <Button variant="contained" fullWidth onClick={() => navigate("/log/food-log")}>
        Log Food Consumption
      </Button> (se realizara mas adelante) */}
    </Box>
  );
}
export default LogDashboard;
