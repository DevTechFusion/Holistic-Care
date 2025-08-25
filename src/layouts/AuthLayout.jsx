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
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          position: "relative",
          width: {
            xs: "100%", // small screens
            md: "80%", // medium and up
          },
          marginLeft: {
            xs: 0, // small screens
            md: "20%", // medium and up
          },
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
