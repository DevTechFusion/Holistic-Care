import { useEffect, useState } from "react";
import {
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Box,
  Button,
  Stack,
  Select,
  useTheme,
  alpha,
  Typography,
} from "@mui/material";

import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BusinessIcon from "@mui/icons-material/Business";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AddIcon from "@mui/icons-material/Add";

import CreateProcedureModal from "../../../components/forms/ProcedureForm";
import CreateDepartmentModal from "../../../components/forms/DepartmentForm";
import CreateDoctorModal from "../../../components/forms/DoctorForm";
import CreateAppointmentModal from "../../../components/forms/AppointmentForm";

import AgentWiseBookings from "../../../components/dashboard/AgentWiseBooking";
import SourceWiseBookings from "../../../components/dashboard/SourceWiseBooking";
import DoctorWiseBooking from "../../../components/dashboard/DoctorWiseBooking";
import {
  DoctorLeaderboard,
  StatsCards,
  WelcomeSection,
  RevenueSection,
} from "../../../components/dashboard";
import { useSnackbar } from "notistack";

const Dashboard = () => {
  const [openModal, setOpenModal] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState("weekly");
  const theme = useTheme();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = (type = null) => {
    setAnchorEl(null);
    if (type) setOpenModal(type);
  };

  const handleModalClose = (success = false, message = "", type = null) => {
    setOpenModal(null);
    if (success) {
      enqueueSnackbar(message || `${type} created successfully!`, {
        variant: "success",
        autoHideDuration: 3000,
      });
    } else if (message) {
      enqueueSnackbar(message, { variant: "error", autoHideDuration: 3000 });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 2,
            minWidth: 220,
            mt: 1,
            overflow: "visible",
            filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.1))",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleClose("procedure")}>
          <ListItemIcon>
            <MedicalServicesIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Procedure" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose("department")}>
          <ListItemIcon>
            <BusinessIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Department" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose("doctor")}>
          <ListItemIcon>
            <LocalHospitalIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Doctor" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose("appointment")}>
          <ListItemIcon>
            <LocalHospitalIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Appointment" />
        </MenuItem>
      </Menu>

      {/* Modals */}

      <CreateProcedureModal
        open={openModal === "procedure"}
        onClose={(success, message) =>
          handleModalClose(success, message, "Procedure")
        }
      />
      <CreateDepartmentModal
        open={openModal === "department"}
        onClose={(success, message) =>
          handleModalClose(success, message, "Department")
        }
      />
      <CreateDoctorModal
        open={openModal === "doctor"}
        onClose={(success, message) =>
          handleModalClose(success, message, "Doctor")
        }
      />
      <CreateAppointmentModal
        open={openModal === "appointment"}
        onClose={(success, message) =>
          handleModalClose(success, message, "Appointment")
        }
      />

      {/* Header Section */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "start" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <WelcomeSection />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              minWidth: { xs: "100%", sm: 120 },
              borderRadius: 2,
              fontWeight: "medium",
              bgcolor: "background.paper",
              boxShadow: theme.shadows[1],
              "& .MuiOutlinedInput-notchedOutline": {
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              },
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.03),
              },
            }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>

          <Button
            variant="contained"
            onClick={handleClick}
            startIcon={<AddIcon />}
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              boxShadow: theme.shadows[2],
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Create New
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Stack
        direction="row"
        spacing={6}
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          mt: 4,
          mb: 4,
        }}
      >
        {/* Stat Cards Section */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", lg: "0 0 40%" },
            mb: { xs: 4, lg: 0 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Stat Cards
          </Typography>
          <StatsCards filter={filter} />
        </Box>

        {/* Leaderboard Section */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", lg: "0 0 55%" },
          }}
        >
          <DoctorLeaderboard filter={filter} />
        </Box>
      </Stack>

      {/* Revenue Section */}
      <Box sx={{ my: 4 }}>
        <RevenueSection filter={filter} />
      </Box>

      {/* Bookings Section */}
      <Box sx={{ my: 4 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 3, lg: 4 }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", lg: "block" } }}
            />
          }
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <AgentWiseBookings filter={filter} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SourceWiseBookings filter={filter} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DoctorWiseBooking filter={filter} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;
