import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton as MuiIconButton,
  Button,
  Link,
} from "@mui/material";
import {
  ArrowBackIosNew,
  Mail,
  Lock,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate, Link as LinkRouter } from "react-router";
import { BannerTop } from "../components/BannerTop";
import useAuthToken from "../hooks/useAuthToken";

export function Login() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = React.useState(false);
  const { login } = useAuthToken();

  const handleChange = (field) => (e) =>
    setForm((v) => ({ ...v, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      if (result) {
        // Pequeño delay para asegurar que el token se aplique
        setTimeout(() => {
          navigate('/');
        }, 100);
      }
    } catch (err) {
      alert(`Login failed: ${err?.data?.message || err.message}`);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <BannerTop title="Sign In" backTo="/welcome" />

      {/* 🔹 Contenido principal */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        id="login-form"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 2,
          py: 3,
          // Fill available height minus bottom fixed controls so content can
          // be centered vertically on mobile while keeping bottom button area
          // visible.
          minHeight: `calc(100vh - 96px)`,
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
          border: "none",
          boxShadow: "none",
          p: 2,
          mt: 0,
          width: "100%",
          borderRadius: 2
          }}
        >
          {/* Campos de entrada */}
              <TextField
                label="Email"
                margin="normal"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                fullWidth
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MuiIconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="start"
                        tabIndex={-1}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </MuiIconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
      </Box>

      {/* 🔹 Botón inferior y enlace */}
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
          type="submit"
          variant="contained"
          form="login-form"
          size="large"
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1.5,
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Sign In
        </Button>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Link
            component={LinkRouter}
            to="/forgot-password"
            underline="hover"
            variant="body2"
            color="primary"
            sx={{ fontWeight: 500 }}
          >
            Forgot your password?
          </Link>
        </Box>
      </Box>

      <Box sx={{ height: 96 }} />
    </Box>
  );
}
