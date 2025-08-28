import { useState } from "react";
import {
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BusinessIcon from "@mui/icons-material/Business";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

import CreateUserModal from "../../components/forms/UserForm";
import CreateProcedureModal from "../../components/forms/ProcedureForm";
import CreateDepartmentModal from "../../components/forms/DepartmentForm";
import CreateDoctorModal from "../../components/forms/DoctorForm";
import DashboardContent from "./DashboardContent";
import CreateAppointmentModal from "../../components/forms/AppointmentForm";

const Dashboard = () => {
  const [openModal, setOpenModal] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (type = null) => {
    setAnchorEl(null);
    if (type) setOpenModal(type);
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
        onClose={() => setOpenModal(null)}
      />
      <CreateProcedureModal
        open={openModal === "procedure"}
        onClose={() => setOpenModal(null)}
      />
      <CreateDepartmentModal
        open={openModal === "department"}
        onClose={() => setOpenModal(null)}
      />
      <CreateDoctorModal
        open={openModal === "doctor"}
        onClose={() => setOpenModal(null)}
      />
      <CreateAppointmentModal
        open={openModal === "appointment"}
        onClose={() => setOpenModal(null)}
      />

      <DashboardContent handleClick={handleClick} />
      {/* <WeeklyAvailability /> */}
    </div>
  );
};

export default Dashboard;
