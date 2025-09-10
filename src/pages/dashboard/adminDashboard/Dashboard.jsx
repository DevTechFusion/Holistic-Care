// src/pages/dashboard/adminDashboard/Dashboard.jsx
import { useState } from "react";
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
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BusinessIcon from "@mui/icons-material/Business";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import CreateUserModal from "../../../components/forms/UserForm";
import CreateProcedureModal from "../../../components/forms/ProcedureForm";
import CreateDepartmentModal from "../../../components/forms/DepartmentForm";
import CreateDoctorModal from "../../../components/forms/DoctorForm";
import CreateAppointmentModal from "../../../components/forms/AppointmentForm";

import AgentWiseBookings from "../../../components/dashboard/AgentWiseBooking";
import SourceWiseBookings from "../../../components/dashboard/SourceWiseBooking";
import DoctorWiseBooking from "../../../components/dashboard/DoctorWiseBooking";
import {
  DoctorLeaderboard,
  RevenueSection,
  StatsCards,
  WelcomeSection,
} from "../../../components/dashboard";

import { useSnackbar } from "notistack";

const Dashboard = () => {
  const [openModal, setOpenModal] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [filter, setFilter] = useState("weekly");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

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
      enqueueSnackbar(message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  return (
    <Box sx={{ bgcolor: "#f9f9f9", minHeight: "100vh", p: 3 }}>
      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
        PaperProps={{
          elevation: 6,
          sx: { borderRadius: 2, minWidth: 200, mt: 1 },
        }}
      >
        <MenuItem onClick={() => handleClose("user")}>
          <ListItemIcon>
            <PersonAddAltIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="User" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose("procedure")}>
          <ListItemIcon>
            <MedicalServicesIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Procedure" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose("department")}>
          <ListItemIcon>
            <BusinessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Department" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose("doctor")}>
          <ListItemIcon>
            <LocalHospitalIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Doctor" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleClose("appointment")}>
          <ListItemIcon>
            <LocalHospitalIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Appointment" />
        </MenuItem>
      </Menu>

      {/* Modals */}
      <CreateUserModal
        open={openModal === "user"}
        onClose={(success, message) => handleModalClose(success, message, "User")}
      />
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
        onClose={(success, message) => handleModalClose(success, message, "Doctor")}
      />
      <CreateAppointmentModal
        open={openModal === "appointment"}
        onClose={(success, message) =>
          handleModalClose(success, message, "Appointment")
        }
      />

      {/* Top Section */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        spacing={2}
        mb={4}
      >
        <WelcomeSection />
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleClick}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: "bold",
              px: 3,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            + Create New
          </Button>
          <Select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{
              borderRadius: "12px",
              fontWeight: "bold",
              bgcolor: "#fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              px: 2,
            }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </Stack>
      </Stack>

       
          <StatsCards filter={filter} />
        
        
          <DoctorLeaderboard filter={filter} />
     

        
        
          <RevenueSection filter={filter} />
        

          <Grid container spacing={2}>
        {/* Bottom 3 Tables */}
        <Grid item xs={12} md={4}>
          <AgentWiseBookings filter={filter} />
        </Grid>
        <Grid item xs={12} md={4}>
          <SourceWiseBookings filter={filter} />
        </Grid>
        <Grid item xs={12} md={4}>
          <DoctorWiseBooking filter={filter} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
