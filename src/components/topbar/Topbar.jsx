import { Box, Typography, Avatar, IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { isArray } from "lodash";

const Topbar = ({ onMenuClick, isSidebarOpen = false, sidebarCollapsed = false }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        height: 80,
        backgroundColor: "#F0F2F5",
        borderBottom: "2px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: { xs: 2, md: 3 },
        pl: { md: sidebarCollapsed ? '88px' : '296px' },
        position: "sticky",
        top: 0,
        zIndex: 1099,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        transition: 'padding-left 0.3s ease',
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={onMenuClick}
          sx={{
            color: "text.primary",
            display: { xs: 'flex', md: 'none' },
            "&:hover": {
              backgroundColor: "primary.main",
              color: "white",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "end",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "#23C7B7",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: 600, 
                color: "text.primary",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px'
              }}
            >
              {user?.name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: "text.secondary",
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
                display: 'block'
              }}
            >
              {isArray(user?.roles) ? user.roles[0]?.name : ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;