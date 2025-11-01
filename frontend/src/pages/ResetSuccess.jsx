import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router";
import { BannerTop } from "../components/BannerTop";

export function ResetSuccess() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <BannerTop title="Reset password" backTo="/login" />

      {/* Content */}
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

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 340, lineHeight: 1.6 }}>
          You have successfully changed your password.
        </Typography>
      </Box>

      {/* Bottom button */}
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
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => navigate("/login")}
          sx={{ borderRadius: 2, py: 1.5, fontWeight: "bold", textTransform: "none" }}
        >
          Go to Login
        </Button>
      </Box>

      <Box sx={{ height: 100 }} />
    </Box>
  );
}


