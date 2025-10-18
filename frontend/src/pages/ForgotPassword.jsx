import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Link,
} from "@mui/material";
import { Mail } from "@mui/icons-material";
import { useNavigate } from "react-router";
import { BannerTop } from "../components/BannerTop"; // ✅ default import

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendCode = () => {
    navigate("/reset-password", { state: { email } });
    console.log("Send reset code to:", email);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <BannerTop title="Forgot password" backTo="/login" />

      {/* 🔹 Contenido centrado */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
          minHeight: "calc(90vh - 100px)", // resta el alto del header y botón inferior
        }}
      >
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 320, lineHeight: 1.6 }}
        >
          We will send a password reset code to your email account.
        </Typography>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          sx={{ maxWidth: 320 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 🔹 Panel inferior con botón largo */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          p: 2,
          pb: `calc(16px + env(safe-area-inset-bottom))`,
          bgcolor: "background.paper",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleSendCode}
          disabled={!email}
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Send code
        </Button>
      </Box>

      {/* Espaciador para evitar superposición */}
      <Box sx={{ height: 100 }} />
    </Box>
  );
}
