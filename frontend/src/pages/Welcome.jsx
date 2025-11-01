import { Box, Button, Paper, Typography, Link } from "@mui/material";
import Logo from "../assets/logo.svg"; // Importa tu SVG como componente React

import { Link as LinkRouter } from "react-router";

export function Welcome() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        position: "relative",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      {/* Logo centrado */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
          flexDirection: "column",
        }}
      >
        <Box
          component="img"
          src={Logo}
          alt="App logo"
          sx={{ width: 160, height: 'auto', maxWidth: '60%' }}
        />
        {/* Texto debajo del logo */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 300 }}>
          Start or sign in to your account
        </Typography>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          pb: `calc(16px + env(safe-area-inset-bottom))`,
          border: "none",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            component={LinkRouter}
            to="/register"
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Start
          </Button>

          <Box
            sx={{
              textAlign: "center",
              fontSize: 14,
              color: "text.secondary",
              border: "none",
              boxShadow: "none",
            }}
          >
            Already have an account?
            <Link
              component={LinkRouter}
              to="/login"
              underline="hover"
              variant="body2"
              color="primary"
              sx={{ fontWeight: 500, marginLeft: 0.5 }}
            >
              Sign In
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
