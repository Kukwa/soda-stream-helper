import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/auth/LoginPage.jsx";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import LandingPage from "./pages/LandingPage.jsx";
import { RegisterPage } from "./pages/auth/RegisterPage.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";
import { AuthContext } from "./context/AuthContext.jsx";
import { MainLayout } from "./components/layouts/MainLayout.jsx";
import { DashboardLayout } from "./components/layouts/DashboardLayout.jsx";
import { ProtectedRoute } from "./pages/ProtectedRoute.jsx";
import { AuthLayout } from "./components/layouts/AuthLayout.jsx";
import "@mantine/charts/styles.css";
import { ItemsListPage } from "./pages/dashboard/ItemsListPage.jsx";
import { ItemmDetailsPage } from "./pages/dashboard/ItemDetailsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "items",
            element: <ItemsListPage />,
          },
          {
            path:"items/:id",
            element:<ItemmDetailsPage/>
          }
        ],
      },
    ],
  },
]);

const theme = createTheme({
  colors: {
    blue: [
      "#ebefff",
      "#d5dafc",
      "#a9b1f1",
      "#7b87e9",
      "#5362e1",
      "#3a4bdd",
      "#2d3fdc",
      "#1f32c4",
      "#182cb0",
      "#0b259c",
    ],
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthContext>
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
      </MantineProvider>
    </AuthContext>
  </React.StrictMode>
);
