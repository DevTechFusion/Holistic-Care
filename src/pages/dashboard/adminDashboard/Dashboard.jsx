import { useEffect, useState } from "react";
import {
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Stack,
  TextField,
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
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

  const handleApplyFilters = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
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
        sx={{ mb: { xs: 3, sm: 4 } }}
      >
        <WelcomeSection />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
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
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: { xs: "100%", sm: 160 },
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          />

          <TextField
            label="End Date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: { xs: "100%", sm: 160 },
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          />

          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            Apply
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleClearFilters}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            Clear
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          mb: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2rem" },
            }}
          >
            Statistics Overview
          </Typography>
          <StatsCards startDate={appliedStartDate} endDate={appliedEndDate} />
        </Box>

        <Box sx={{ flex: 1 }}>
          <DoctorLeaderboard
            startDate={appliedStartDate}
            endDate={appliedEndDate}
          />
        </Box>
      </Box>

      {/* Revenue Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <RevenueSection startDate={appliedStartDate} endDate={appliedEndDate} />
      </Box>

      {/* Bookings Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            mb: { xs: 2, sm: 3 },
            fontWeight: 700,
            fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2rem" },
          }}
        >
          Bookings Analysis
        </Typography>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 2, sm: 3, lg: 4 }}
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: "none", lg: "block" } }}
            />
          }
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <AgentWiseBookings
              startDate={appliedStartDate}
              endDate={appliedEndDate}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SourceWiseBookings
              startDate={appliedStartDate}
              endDate={appliedEndDate}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <DoctorWiseBooking
              startDate={appliedStartDate}
              endDate={appliedEndDate}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;
