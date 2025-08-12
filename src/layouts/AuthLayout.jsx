import { Box } from "@mui/material";
import React from "react";
import Topbar from "../components/topbar/Topbar";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";

const AuthLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          marginLeft: "280px", // Match sidebar width
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          position: "relative",
        }}
      >
        <Topbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
