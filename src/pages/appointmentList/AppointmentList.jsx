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
  TableContainer,
} from "@mui/material";
import { getAppointments, deleteAppointment } from "../../DAL/appointments";
import CreateAppointmentModal from "../../components/forms/AppointmentForm";
import ActionButtons from "../../constants/actionButtons";
import FilterPopover from "./FilterPopover";
import { useSnackbar } from "notistack";
import ComplaintForm from "../../components/forms/ComplaintForm";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";

const AppointmentsPage = () => {
  const { user } = useAuth(); 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    doctor_id: "",
    agent_id: "",
    department_id: "",
    procedure_id: "",
    order_by: "created_at",
    order_direction: "desc",
  });

  const fetchAppointments = async () => {
  setLoading(true);
  try {
    let apiFilters = { ...filters };
    if (user?.roles?.[0]?.name === "agent") {
      apiFilters.agent_id = user.id;
    }

    const res = await getAppointments(
      page + 1,
      rowsPerPage,
      apiFilters.start_date,
      apiFilters.end_date,
      apiFilters.doctor_id,
      apiFilters.agent_id,
      apiFilters.department_id,
      apiFilters.procedure_id,
      apiFilters.order_by,
      apiFilters.order_direction
    );

    const data = res?.data?.data || [];
    setAppointments(data);

    setTotal(res?.data?.total || 0);
  } catch (err) {
    console.error("Failed to fetch appointments", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage, filters, user]);

  const handleDeleteAppointment = async (id) => {
    try {
      await deleteAppointment(id);
      fetchAppointments();
      enqueueSnackbar("Appointment deleted successfully", { variant: "success" });
    } catch (err) {
      console.error("Failed to delete appointment", err);
      enqueueSnackbar("Failed to delete appointment", { variant: "error" });
    }
  };

  const handleUpdateAppointment = (appointment) => {
    setTargetItem(appointment);
    setOpenModal(true);
  };

  const handleCreateAppointment = () => {
    setTargetItem(null);
    setOpenModal(true);
  };

  const handleAddComplaint = (appointment) => {
    setTargetItem(appointment);
    setComplaintModalOpen(true);
  };

  const handleCloseComplaint = () => {
    setTargetItem();
    setComplaintModalOpen(false);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Appointments</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={(e) => setFilterAnchor(e.currentTarget)}
          >
            Filters
          </Button>
          <Button variant="contained" onClick={handleCreateAppointment}>
            + Add Appointment
          </Button>
        </Box>
      </Box>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 700 }}>
              <Table fixed>
                <TableHead>
                  <TableRow>
                    <TableCell>Sr#</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Appt. ID</TableCell>
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
                      <TableCell
                        sx={{
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                          backgroundColor: "#fff",
                          fontWeight: 500,
                        }}
                      >
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>{dayjs(appt.date).format("DD-MM-YYYY")}</TableCell>
                      <TableCell>{appt.start_time}</TableCell>
                      <TableCell>{appt.end_time}</TableCell>
                      <TableCell>{appt.id}</TableCell>
                      <TableCell>{appt.patient_name}</TableCell>
                      <TableCell>{appt.contact_number}</TableCell>
                      <TableCell>{appt.doctor?.name}</TableCell>
                      <TableCell>{appt.agent?.name}</TableCell>
                      <TableCell>
                        {Array.isArray(appt.procedures) && appt.procedures.length > 0
                          ? appt.procedures.map((p) => p.name).join(", ")
                          : appt.procedure?.name || "-"}
                      </TableCell>
                      <TableCell>{appt.department?.name}</TableCell>
                      <TableCell>{appt.source?.name}</TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={() => handleUpdateAppointment(appt)}
                          onDelete={() => handleDeleteAppointment(appt.id)}
                          onAdd={() => handleAddComplaint(appt)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

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
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Modals */}
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

      <ComplaintForm
        data={targetItem}
        open={complaintModalOpen}
        onClose={handleCloseComplaint}
      />

      {/* Filter Popover */}
      <FilterPopover
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
        filters={filters}
        setFilters={(newFilters) => {
          setFilters(newFilters);
          setPage(0);
        }}
      />
    </Box>
  );
};

export default AppointmentsPage;
