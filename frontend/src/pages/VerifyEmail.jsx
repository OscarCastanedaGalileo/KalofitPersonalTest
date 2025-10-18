import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { ArrowBackIosNew } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router";
import { BannerTop } from "../components/BannerTop";

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  const handleResend = () => {
    // Aquí iría tu lógica para reenviar el correo
    console.log("Resending verification link to:", email);
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <BannerTop title="Verify Email" backTo="/welcome" />

      {/* 🔹 Contenido principal */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
          py: 6,
          minHeight: "70vh",
        }}
      >

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 340, lineHeight: 1.6 }}
        >
          We have sent an account activation link
          to your email, <b>{email}</b>. Please
          activate your account before logging in
        </Typography>
      </Box>

      {/* 🔹 Botones inferiores */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          pb: `calc(16px + env(safe-area-inset-bottom))`,
          bgcolor: "background.paper",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate("/login")}
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Go to Login
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          onClick={handleResend}
          sx={{
            borderRadius: 2,
            py: 1.5,
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Resend
        </Button>
      </Box>

      <Box sx={{ height: 100 }} />
    </Box>
  );
}
