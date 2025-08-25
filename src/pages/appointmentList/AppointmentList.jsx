// src/pages/appointments/AppointmentsPage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { getAppointments } from "../../DAL/appointments";
import CreateAppointmentModal from "../../components/forms/AppointmentForm";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Fetch Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAppointments();
      setAppointments(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Appointments</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Appointment
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time Slot</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Procedure</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt, idx) => (
                <TableRow key={appt.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{appt.date}</TableCell>
                  <TableCell>{appt.time_slot}</TableCell>
                  <TableCell>{appt.patient_name}</TableCell>
                  <TableCell>{appt.contact_number}</TableCell>
                  <TableCell>{appt.doctor?.name}</TableCell>
                  <TableCell>{appt.procedure?.name}</TableCell>
                  <TableCell>{appt.department?.name}</TableCell>
                  <TableCell>{appt.source?.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchAppointments(); // refresh after creating
        }}
      />
    </Box>
  );
};

export default AppointmentsPage;
