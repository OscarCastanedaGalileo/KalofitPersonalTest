import React from "react";
import {
  Box,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff, PhotoCamera, Person, Mail, Lock } from "@mui/icons-material";

import { useNavigate } from "react-router";
import { BannerTop } from "../components/BannerTop";
import { register } from "../api/auth";
export function Register() {
  const [preview, setPreview] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handlePickImage = () => fileInputRef.current?.click();
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      if (err?.data?.message || err.message) {
        alert(`Error: ${err?.data?.message || err.message}`);
      }
    }
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* 🔹 Encabezado con botón de volver */}
      <BannerTop title="Register" backTo="/welcome" />

      {/* 🔹 Contenido principal */}
      <Box
        component="form"
        id="register-form"
        noValidate
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: 2,
          py: 3,
          // Match Login.jsx vertical centering
          minHeight: `calc(90vh - 96px)`,
          justifyContent: "center",
        }}
      >
        {/* Avatar + selector */}
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <IconButton
              onClick={handlePickImage}
              size="small"
              sx={{
                bgcolor: "background.paper",
                boxShadow: 2,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          }
        >
          <Avatar src={preview || undefined} sx={{ width: 96, height: 96 }} />
        </Badge>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange}
        />

        <Box sx={{
          border: "none",
          boxShadow: "none",
          p: 2,
          mt: 0,
          width: "100%",
          borderRadius: 2
        }}>
          {/* Campos */}
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="end">
                  <Lock />
                </InputAdornment>

              ),
              endAdornment: (
                <InputAdornment position="start">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="start">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            type={showConfirm ? "text" : "password"}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="start">
                    {showConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* 🔹 Botón inferior */}
      <Box
        elevation={6}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          border: "none",
          boxShadow: "none",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          p: 2,
          pb: `calc(16px + env(safe-area-inset-bottom))`
        }}
      >
        <Button
          variant="contained"
          size="large"
          type="submit"
          form="register-form"
          fullWidth
          sx={{ borderRadius: 2, py: 1.4, textTransform: "none", fontWeight: 600 }}
        >
          Register
        </Button>
      </Box>

      <Box sx={{ height: 96 }} />
    </Box>
  );
}
