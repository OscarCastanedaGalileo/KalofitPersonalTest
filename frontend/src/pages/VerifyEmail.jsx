import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Link,
  Box,
  Button,
} from "@mui/material";
import { ArrowBackIosNew } from "@mui/icons-material";
import { useNavigate, useLocation, Link as LinkRouter } from "react-router";

import { BannerTop } from "../components/BannerTop";
import { useLoaderData } from "react-router";
import { verifyEmail, sendVerificationEmail } from "../api/auth";
export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";
  const { token } = useLoaderData();
  const [message, setMessage] = useState({});

  useEffect(() => {
    if (!token) return;
    let isMounted = true;
    verifyEmail(token)
      .then(() => {
        if (!isMounted) return;
        setMessage({ type: "success", text: "Email verified successfully! You can now log in." });
        // navigate("/login");
      })
      .catch((err) => {
        if (!isMounted) return;
        setMessage({ type: "error", text: `Verification failed: ${err?.data?.message || err.message}` });
      });

    return () => {
      isMounted = false; // cleanup
    };
  }, [token, navigate]);

  const handleResend = async () => {
    try {
      const response = await sendVerificationEmail(email);
      alert(response?.message || 'Verification email resent. Please check your inbox.');
    } catch (error) {
      alert(`Error resending verification email: ${error?.data?.message || error.message}`);
    }
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
        {
          !token ? (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 340, lineHeight: 1.6 }}
            >
              We have sent an account activation link
              to your email, <b>{email}</b>. Please
              activate your account before logging in
            </Typography>
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 340, lineHeight: 1.6 }}
            >
              {message.text}
            </Typography>
          )
        }
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
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Link
                    // component={LinkRouter}
                    // to="/forgot-password"
                    onClick={handleResend}
                    underline="hover"
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  >
                    Resend
                  </Link>
                </Box>
      </Box>

      <Box sx={{ height: 100 }} />
    </Box>
  );
}
