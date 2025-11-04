import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router";
// import './index.css'
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// import CssBaseline from '@mui/material/CssBaseline';

import App from "./App.jsx";
import { Welcome } from "./pages/Welcome.jsx";
import { Register } from "./pages/Register.jsx";
import { Login } from "./pages/Login.jsx";
import { VerifyEmail } from "./pages/VerifyEmail.jsx";
import { ForgotPassword } from "./pages/ForgotPassword.jsx";
import { ResetPassword } from "./pages/ResetPassword.jsx";
import { ResetSuccess } from "./pages/ResetSuccess.jsx";
import RegisterFood from "./pages/RegisterFood.jsx";
import { Report } from "./pages/Report.jsx";
import FoodsList from "./pages/FoodsList.jsx";
import EditFood from "./pages/EditFood.jsx";
import FoodLog from "./pages/FoodLog.jsx";
import LogWater from "./pages/LogWater.jsx";
import Reports from "./pages/Reports.jsx";
import FoodUnits from "./pages/FoodUnits.jsx";
import Categories from "./pages/Categories.jsx";
import FoodConsumption from "./pages/FoodConsumption.jsx";
import DayDetails from "./pages/DayDetails.jsx";
import Profile from "./pages/Profile.jsx";
import Users from "./pages/Users.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import NotificationsConfig from "./pages/NotificationsConfig.jsx";
import ReminderForm from "./pages/ReminderForm.jsx";
import ExportHistory from "./pages/ExportHistory.jsx";
import {
  Layout,
} from './components/Layout.jsx'
import { RootProvider } from './Root.jsx';
import RecipeCreator from "./pages/RecipeCreator.jsx";
import RecipeConsumption from "./pages/RecipeConsumption.jsx";
import EditRecipe from "./pages/EditRecipe.jsx";
import RecipeList from "./pages/RecipeList.jsx";

import './index.css';
const rootLoader = () => null;
// import { verify } from "crypto";
// import { verifyEmail } from "./api/auth.js";
import { authMiddleware } from "./guards/authMiddleware.jsx";
import { adminMiddleware } from "./guards/adminMiddleware.jsx";
import { guestMiddleware } from "./guards/guestMiddleware.jsx";


async function loggingMiddleware({ request }, next) {
  console.log(`Request: ${request.method} ${request.url}`);
  let response = await next();
  console.log(
    `Response: ${response.status} ${request.method} ${request.url}`,
  );
  return response;
}
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    middleware: [loggingMiddleware, authMiddleware],
    loader: rootLoader,
    children: [
      { index: true, element: <App /> },
  { path: "/register-food", element: <RegisterFood /> },
  { path: "/foods-list", element: <FoodsList /> },
  { path: "/edit-food/:id", element: <EditFood /> },
  { path: "/log/food-log", element: <FoodLog /> },
  { path: "/water", element: <LogWater /> },
  // { path: '/report', element: <Report /> },
  { path: "/reports", element: <Reports /> },
  { path: "/food-units", element: <FoodUnits /> },
  { path: "/food-consumption/new", element: <FoodConsumption /> },
  { path: "/food-consumption/:id", element: <FoodConsumption /> },
  { path: "/day-details/:date", element: <DayDetails /> },
  { path: "/recipes", element: <RecipeList /> },
  { path: "/recipes/new", element: <RecipeCreator /> },
  { path: "/recipes/edit/:id", element: <EditRecipe /> },
  { path: "/recipe-consumption/new", element: <RecipeConsumption /> },
  { path: "/profile", element: <Profile /> },
  { path: "/notifications", element: <NotificationsPage /> },
  { path: "/notifications/new",element: <ReminderForm /> },
  { path: "/notifications/:id", element: <ReminderForm /> },
  { path: "/notifications/config", element: <NotificationsConfig /> },
  { path: "/export-history", element: <ExportHistory /> },
    ],
  },
  {
    path: "/",
    element: <Layout />,
    middleware: [loggingMiddleware, authMiddleware, adminMiddleware],
    loader: rootLoader,
    children: [
      { path: "/users", element: <Users /> },
      { path: "/categories", element: <Categories /> }
    ],
  },
  {
    path: "/",
    middleware: [loggingMiddleware, guestMiddleware],
    rootLoader: rootLoader,
    children: [
      {
        path: "/welcome",
        element: <Welcome />,
      },

      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: '/verify-email/:token?',
        element: <VerifyEmail />,
        loader: async ({ params }) => {
          return { token: params.token };
        }
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
      },
      {
        path: "/reset-success",
        element: <ResetSuccess />,
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootProvider router={router} />
  </React.StrictMode>,
);
