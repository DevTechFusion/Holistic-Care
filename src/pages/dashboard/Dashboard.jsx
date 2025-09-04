// Dashboard.jsx
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
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BusinessIcon from "@mui/icons-material/Business";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import CreateUserModal from "../../components/forms/UserForm";
import CreateProcedureModal from "../../components/forms/ProcedureForm";
import CreateDepartmentModal from "../../components/forms/DepartmentForm";
import CreateDoctorModal from "../../components/forms/DoctorForm";
import CreateAppointmentModal from "../../components/forms/AppointmentForm";

import AgentWiseBookings from "../../components/dashboard/AgentWiseBooking";
import SourceWiseBookings from "../../components/dashboard/SourceWiseBooking";
import DoctorWiseBooking from "../../components/dashboard/DoctorWiseBooking";
import {
  DoctorLeaderboard,
  RevenueSection,
  StatsCards,
  WelcomeSection,
} from "../../components/dashboard";

import { useSnackbar } from "notistack";

const Dashboard = () => {
  const [openModal, setOpenModal] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (type = null) => {
    setAnchorEl(null);
    if (type) setOpenModal(type);
  };

  // Centralized modal close + snackbar feedback
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
    <div>
      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleClose()}
        PaperProps={{
          elevation: 6,
          sx: {
            borderRadius: "10px",
            minWidth: 200,
            mt: 1,
            overflow: "hidden",
          },
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

      {/* Modals with success/error handling */}
      <CreateUserModal
        open={openModal === "user"}
        onClose={(success, message) =>
          handleModalClose(success, message, "User")
        }
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

      <Box sx={{ mt: 2 }}>
        {/* Welcome Section + Create Button */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start"
          flexWrap="wrap"
          spacing={2}
          mb={4}
        >
          <WelcomeSection />
          <Button
            variant="contained"
            onClick={handleClick}
            sx={{
              background: "linear-gradient(135deg, primary.main, primary.dark)",
              borderRadius: "xl",
              textTransform: "none",
              fontWeight: "bold",
              px: 3,
              py: 1,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                background: "linear-gradient(135deg, primary.dark, primary.main)",
              },
            }}
          >
            + Create New
          </Button>
        </Stack>

        <Grid container spacing={3} width="100%">
          <Grid item xs={12} md={6}>
            <StatsCards />
          </Grid>
          <Grid item xs={12} md={6}>
            <DoctorLeaderboard />
          </Grid>
          <Grid item xs={12}>
            <RevenueSection />
          </Grid>
        </Grid>
      </Box>

      <AgentWiseBookings />
      <SourceWiseBookings />
      <DoctorWiseBooking />
    </div>
  );
};

export default Dashboard;
