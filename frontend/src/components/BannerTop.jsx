import React from "react";
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import { ArrowBackIosNew } from "@mui/icons-material";
import { Link } from "react-router";

export function BannerTop({ title = "", backTo = "/", onBack }) {
  return (
    <AppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{ pt: 1 }}
    >
      <Toolbar>
        {/* 🔹 Flecha con comportamiento flexible */}
        {onBack ? (
          <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back">
            <ArrowBackIosNew />
          </IconButton>
        ) : (
          <IconButton
            component={Link}
            to={backTo}
            edge="start"
            color="inherit"
            aria-label="back"
          >
            <ArrowBackIosNew />
          </IconButton>
        )}

        {/* 🔹 Título centrado */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            mr: 4, // equilibrio visual del ícono
          }}
        >
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
