import React from "react";
import ReactDOM from "react-dom/client";


import { createBrowserRouter, RouterProvider } from "react-router";
// import './index.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// import CssBaseline from '@mui/material/CssBaseline';

import App from './App.jsx'
import { Welcome } from './pages/Welcome.jsx';
import { Register } from './pages/Register.jsx';
import { Login } from './pages/Login.jsx';
import { VerifyEmail } from './pages/VerifyEmail.jsx';
import { ForgotPassword } from './pages/ForgotPassword.jsx';
import { ResetPassword } from './pages/ResetPassword.jsx';
import { ResetSuccess } from './pages/ResetSuccess.jsx';
import RegisterFood from './pages/RegisterFood.jsx';
import FoodsList from './pages/FoodsList.jsx';
import EditFood from './pages/EditFood.jsx';
import FoodLog from './pages/FoodLog.jsx';
import LogDashboard from './pages/LogDashboard.jsx';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';

const theme = createTheme({
  colorSchemes: { dark: true },
});

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/log", element: <LogDashboard /> },
  { path: "/log/register-food", element: <RegisterFood /> },
  { path: "/log/foods-list", element: <FoodsList /> },
  { path: "/log/edit-food/:id", element: <EditFood /> },
  { path: "/log/food-log", element: <FoodLog /> },
  {
    path: '/',
    index: true,
    element: <App />,
  },
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/reset-success',
    element: <ResetSuccess />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RouterProvider router={router} />
  </ThemeProvider>
);
