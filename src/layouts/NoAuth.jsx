import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress } from "@mui/material";

const NoAuthLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    <Navigate to="/" />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default NoAuthLayout;
