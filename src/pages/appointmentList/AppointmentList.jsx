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
  TablePagination,
} from "@mui/material";
import {
  getAppointments,
  deleteAppointment,
} from "../../DAL/appointments";
import CreateAppointmentModal from "../../components/forms/AppointmentForm";
import ActionButtons from "../../constants/actionButtons";
import { useSnackbar } from "notistack";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch Appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAppointments(page + 1, rowsPerPage);
      setAppointments(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage]);

  const handleDeleteAppointment = async (id) => {
    try {
      await deleteAppointment(id);
      fetchAppointments();
      enqueueSnackbar("Appointment deleted successfully", {
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to delete appointment", err);
      enqueueSnackbar("Failed to delete appointment", {
        variant: "error",
      });
    }
  };


  const handleUpdateAppointment = (appointment) => {
    console.log("Opening edit modal with data:", appointment);
    setTargetItem(appointment); 
    setOpenModal(true);
  };

 
  const handleCreateAppointment = () => {
    setTargetItem(null); // Clear any previous data
    setOpenModal(true);
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Appointments</Typography>
        <Button variant="contained" onClick={handleCreateAppointment}>
          + Add Appointment
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr#</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time Slot</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Procedure</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appt, idx) => (
                  <TableRow key={appt.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{appt.date}</TableCell>
                    <TableCell>{appt.time_slot}</TableCell>
                    <TableCell>{appt.patient_name}</TableCell>
                    <TableCell>{appt.contact_number}</TableCell>
                    <TableCell>{appt.doctor?.name}</TableCell>
                    <TableCell>{appt.agent?.name}</TableCell>
                    <TableCell>{appt.procedure?.name}</TableCell>
                    <TableCell>{appt.department?.name}</TableCell>
                    <TableCell>{appt.source?.name}</TableCell>
                    <TableCell>
                      <ActionButtons
                        onEdit={() => handleUpdateAppointment(appt)}
                        onDelete={() => handleDeleteAppointment(appt.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Create/Edit Appointment Modal */}
      <CreateAppointmentModal
        isEditing={!!targetItem}
        data={targetItem}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchAppointments(); 
          setTargetItem(null);
        }}
      />
    </Box>
  );
};

export default AppointmentsPage;