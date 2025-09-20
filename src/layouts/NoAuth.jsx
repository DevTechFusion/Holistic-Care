import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress } from "@mui/material";

const NoAuthLayout = () => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log(user, loading, isAuthenticated);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );

    console.log(user, loading, isAuthenticated);

  } else if (isAuthenticated && user) {
    if (user.roles[0].name === "super_admin") {
      return <Navigate to="/dashboard" replace />;
      console.log(user, loading, isAuthenticated);
    } else if (user.roles[0].name === "managerly") {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (user.roles[0].name === "agent") {
      return <Navigate to="/agent/dashboard" replace />;
    }

    console.log(user, loading, isAuthenticated);

    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default NoAuthLayout;
