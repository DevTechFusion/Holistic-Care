import { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import SidebarConfig from "./SidebarConfig";
import logo from "../../assets/images/logo.svg";
import { logout } from "../../DAL/auth";
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleDropdownToggle = (title) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      let token = localStorage.getItem("token");
      await logout(token);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: "0%", md: "20%" },
        height: "100vh",
        background: "white",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        zIndex: 2,
        boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
        borderRight: "1px solid #f0f0f0",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 0",
          borderBottom: "1px solid #eee",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ width: "100%", height: "59px", objectFit: "contain" }}
        />
      </Box>

      {/* Scrollable Menu Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          // Optional: smooth scroll bar styling
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        <List sx={{ flexGrow: 1 }}>
          {(SidebarConfig[user?.roles[0]?.name] || []).map((item) => {
            const parentActive =
              isActive(item.path) ||
              (item.children &&
                item.children.some((child) => isActive(child.path)));

            return (
              <Box key={item.title}>
                {/* Parent Item */}
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() =>
                      item.children
                        ? handleDropdownToggle(item.title)
                        : navigate(item.path)
                    }
                    sx={{
                      borderRadius: "8px",
                      margin: "4px 8px",
                      paddingY: "10px",
                      backgroundColor: parentActive
                        ? "primary.main"
                        : "transparent",
                      color: parentActive ? "white" : "text.primary",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor: parentActive
                          ? "primary.main"
                          : "primary.dark",
                        color: "white",
                        "& .MuiListItemIcon-root": { color: "white" },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <img
                        src={item.icon}
                        alt={item.title}
                        width={22}
                        height={22}
                        style={{
                          filter: parentActive
                            ? "brightness(0) invert(1)"
                            : "none",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={item.title} />

                    {item.children &&
                      (openDropdowns[item.title] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      ))}
                  </ListItemButton>
                </ListItem>

                {/* Dropdown Children */}
                {item.children && (
                  <Collapse
                    in={openDropdowns[item.title]}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((child) => {
                        const childActive = isActive(child.path);
                        return (
                          <ListItem key={child.title} disablePadding>
                            <ListItemButton
                              onClick={() => navigate(child.path)}
                              sx={{
                                pl: 6,
                                py: 1.2,
                                borderRadius: "6px",
                                margin: "2px 8px",
                                backgroundColor: childActive
                                  ? "primary.main"
                                  : "transparent",
                                color: childActive ? "white" : "text.secondary",
                                "&:hover": {
                                  backgroundColor: childActive
                                    ? "primary.dark"
                                    : "primary.light",
                                  color: "white",
                                },
                              }}
                            >
                              <ListItemIcon>
                                <img
                                  src={child.icon}
                                  alt={child.title}
                                  width={20}
                                  height={20}
                                  style={{
                                    filter: childActive
                                      ? "brightness(0) invert(1)"
                                      : "none",
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={child.title}
                                primaryTypographyProps={{ fontSize: "0.9rem" }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>

        {/* Logout Section - stays at bottom */}
        <List sx={{ flexShrink: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: "8px",
                margin: "8px",
                paddingY: "10px",
                color: "error.main",
                "&:hover": {
                  backgroundColor: "error.light",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
