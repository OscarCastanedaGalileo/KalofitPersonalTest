import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Modal,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import * as api from "../api";
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router';

export default function NotificationsPage({ open, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // Función auxiliar para calcular tiempo transcurrido
  const getTimeAgo = (timeString) => {
    if (!timeString) return "";
    try {
      const now = new Date();
      const [hours, minutes] = timeString.split(":").map(Number);
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);

      let diffMs = now - notificationTime;
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // si es del día anterior

      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } catch {
      return "";
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getReminders();
      setNotifications(data);
    } catch (err) {
      setError(err.message || "Error loading notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 420,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 3,
          p: 3,
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Tooltip title="Close">
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>

          <Typography variant="h5" fontWeight="bold">
            Notifications
          </Typography>
          <Box>

            <Tooltip title="Configure notifications">
              <IconButton onClick={() => navigate("/notifications/config")}>
                <SettingsIcon color="action" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Loading/Error */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" mt={5}>
            {error}
          </Typography>
        ) : (
          <Paper elevation={2}>
            {notifications.length === 0 ? (
              <Typography align="center" p={4} color="text.secondary">
                No notifications yet.
              </Typography>
            ) : (
              <List>
                {notifications.map((n, index) => (
                  <React.Fragment key={n.id}>
                    <ListItem>
                      <ListItemText
                        primary={n.name}
                        secondary={n.time}
                        primaryTypographyProps={{ fontWeight: "500" }}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="caption" color="text.secondary">
                          {getTimeAgo(n.time)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>
    </Modal>
  );
}
