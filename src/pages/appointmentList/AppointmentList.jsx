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
  Stack,
  TextField,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { getAppointments, deleteAppointment } from "../../DAL/appointments";
import CreateAppointmentModal from "../../components/forms/AppointmentForm";
import ActionButtons from "../../constants/actionButtons";
import { useSnackbar } from "notistack";
import ComplaintForm from "../../components/forms/ComplaintForm";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import { getDoctorsList } from "../../DAL/doctors";
import { getProceduresList } from "../../DAL/procedure";
import { getDepartmentsList } from "../../DAL/departments";
import { getAgentList } from "../../DAL/users";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";
import { has } from "lodash";
const AppointmentsPage = () => {
  const { hasPermission } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
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

  // Lists for inline filters
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);

  const fetchFilterLists = async () => {
    setListsLoading(true);
    try {
      const [docRes, agentRes, deptRes, procRes] = await Promise.all([
        getDoctorsList(),
        getAgentList(),
        getDepartmentsList(),
        getProceduresList(),
      ]);
      setDoctors(Array.isArray(docRes?.data) ? docRes.data : []);
      setAgents(Array.isArray(agentRes?.data) ? agentRes.data : []);
      setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : []);
      setProcedures(Array.isArray(procRes?.data) ? procRes.data : []);
    } catch (err) {
      console.error("Error fetching filter lists:", err);
      setDoctors([]);
      setAgents([]);
      setDepartments([]);
      setProcedures([]);
    } finally {
      setListsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let apiFilters = { ...filters };
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
    fetchFilterLists();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage, filters]);

  const handleDeleteAppointment = async (id) => {
    try {
      const res = await deleteAppointment(id);

      if (res?.status === "error" || (res?.code && res.code !== 200)) {
        enqueueSnackbar(res.message || "Failed to delete appointment", {
          variant: "error",
        });
        return;
      }

      enqueueSnackbar("Appointment deleted successfully", {
        variant: "success",
      });
      fetchAppointments(); // Refresh list
    } catch (error) {
      console.error("Delete appointment failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete appointment";

      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false); // reset loading state
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

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value || "" }));
    setPage(0);
  };

  const clearFilters = () => {
    const cleared = {
      start_date: "",
      end_date: "",
      doctor_id: "",
      agent_id: "",
      department_id: "",
      procedure_id: "",
      order_by: "created_at",
      order_direction: "desc",
    };
    setFilters(cleared);
    setPage(0);
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
        <Box display="flex" gap={2}>
          {hasPermission(MODULES.APPOINTMENTS, PERMISSIONS.CREATE) && (
            <Button variant="contained" onClick={handleCreateAppointment}>
              + Add Appointment
            </Button>
          )}
        </Box>
      </Box>

      {/* Inline Filters */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Stack spacing={2}>
          {/* First Row */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              label="Start Date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
            />

            <TextField
              label="End Date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
            />

            <Autocomplete
              options={doctors}
              getOptionLabel={(option) => option.name || ""}
              value={doctors.find((d) => d.id === filters.doctor_id) || null}
              onChange={(e, value) =>
                handleFilterChange("doctor_id", value?.id)
              }
              renderInput={(params) => (
                <TextField {...params} label="Doctor" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1, minWidth: 200 }}
            />
          </Stack>

          {/* Second Row */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
          >
            <Autocomplete
              options={agents}
              getOptionLabel={(option) => option.name || ""}
              value={agents.find((a) => a.id === filters.agent_id) || null}
              onChange={(e, value) => handleFilterChange("agent_id", value?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Agent" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1, minWidth: 200 }}
            />

            <TextField
              select
              label="Department"
              value={filters.department_id}
              onChange={(e) =>
                handleFilterChange("department_id", e.target.value)
              }
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ flex: 1, minWidth: 200 }}
            >
              <Autocomplete
                options={procedures}
                getOptionLabel={(option) => option.name || ""}
                value={
                  procedures.find((p) => p.id === filters.procedure_id) || null
                }
                onChange={(e, value) =>
                  handleFilterChange("procedure_id", value?.id)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Procedure" size="small" />
                )}
                isOptionEqualToValue={(o, v) => o?.id === v?.id}
                disablePortal
                sx={{ flex: 1 }}
              />

              <Button
                variant="outlined"
                color="error"
                onClick={clearFilters}
                size="small"
                sx={{
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

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
                  {appointments.length > 0 ? (
                    appointments.map((appt, idx) => (
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
                        <TableCell>
                          {dayjs(appt.date).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell>{appt.start_time}</TableCell>
                        <TableCell>{appt.end_time}</TableCell>
                        <TableCell>{appt.id}</TableCell>
                        <TableCell>{appt.patient_name}</TableCell>
                        <TableCell>{appt.contact_number}</TableCell>
                        <TableCell>{appt.doctor?.name}</TableCell>
                        <TableCell>{appt.agent?.name}</TableCell>
                        <TableCell>
                          {Array.isArray(appt.procedures) &&
                          appt.procedures.length > 0
                            ? appt.procedures.map((p) => p.name).join(", ")
                            : appt.procedure?.name || "-"}
                        </TableCell>
                        <TableCell>{appt.department?.name}</TableCell>
                        <TableCell>{appt.source?.name}</TableCell>
                        <TableCell>
                          <ActionButtons
                            onEdit={
                              hasPermission(
                                MODULES.APPOINTMENTS,
                                PERMISSIONS.EDIT
                              )
                                ? () => handleUpdateAppointment(appt)
                                : null
                            }
                            onDelete={
                              hasPermission(
                                MODULES.APPOINTMENTS,
                                PERMISSIONS.DELETE
                              )
                                ? () => handleDeleteAppointment(appt.id)
                                : null
                            }
                            onAdd={
                              hasPermission(
                                MODULES.COMPLAINTS,
                                PERMISSIONS.CREATE
                              )
                                ? () => handleAddComplaint(appt)
                                : null
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
                        No appointments found
                      </TableCell>
                    </TableRow>
                  )}
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
    </Box>
  );
};

export default AppointmentsPage;
