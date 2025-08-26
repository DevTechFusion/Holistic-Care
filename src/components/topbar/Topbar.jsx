import { Box, Typography, Avatar } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { isArray } from "lodash";

const Topbar = () => {
  const { user } = useAuth();
  return (
    <>
      <Box
        sx={{
          height: 80,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          px: 3,
          position: "sticky",
          top: 0,
          zIndex: 2,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        {/* Left Section - Search Bar */}
        {/* <Box sx={{ display: "flex", alignItems: "center", minWidth: 350 }}>
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                "&:hover": {
                  backgroundColor: "#eeeeee",
                },
                "&.Mui-focused": {
                  backgroundColor: "white",
                },
              },
            }}
          />
        </Box> */}

        {/* Right Section - User Info, Calendar, Create Button */}
        <Box
          sx={{
            display: "flex",
            alignItems: "end",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* Notifications */}
          {/* <IconButton
            sx={{
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            <NotificationsIcon />
          </IconButton> */}

          {/* User Profile */}
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
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {isArray(user?.roles) ? user.roles[0]?.name : ""}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Topbar;
