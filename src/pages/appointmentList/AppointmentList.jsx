import { useEffect, useState, useRef } from "react";
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
  TableSortLabel,
  Popover,
} from "@mui/material";
import { getAppointments, deleteAppointment } from "../../DAL/appointments";
import CreateAppointmentModal from "../../components/forms/AppointmentForm";
import ActionButtons from "../../constants/actionButtons";
import { useSnackbar } from "notistack";
import ComplaintForm from "../../components/forms/ComplaintForm";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import { getDoctorsList } from "../../DAL/doctors";
import { getProceduresList } from "../../DAL/procedure";
import { getDepartmentsList } from "../../DAL/departments";
import { getAgentList } from "../../DAL/users";
import { getSelectStatuses } from "../../DAL/status";
import { getSelectRemarks1 } from "../../DAL/remarks1";
import { getSelectRemarks2 } from "../../DAL/remarks2";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const AppointmentsPage = () => {
  const { hasPermission, user } = useAuth();

  // Check if current user is an agent
  const isCurrentUserAgent = Array.isArray(user?.roles) && user.roles.some((role) => role.name?.toLowerCase() === "agent");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  const [dateRangeAnchor, setDateRangeAnchor] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    doctor_id: "",
    agent_id: "",
    department_id: "",
    procedure_id: "",
    patient_name: "",
    contact_number: "",
    status_id: "",
    remarks_1_id: "",
    remarks_2_id: "",
    payment_mode: "",
    order_by: "date",
    order_direction: "desc",
    isBooking: false,
  });

  // Lists for inline filters
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [remarks1, setRemarks1] = useState([]);
  const [remarks2, setRemarks2] = useState([]);
  const [paymentMethods] = useState([
    { id: "cash", name: "Cash" },
    { id: "card", name: "Card" },
    { id: "online", name: "Online" },
    { id: "not_paid", name: "Not Paid" },
  ]);
  const [listsLoading, setListsLoading] = useState(false);

  const fetchFilterLists = async () => {
    setListsLoading(true);
    try {
      const [
        docRes,
        agentRes,
        deptRes,
        procRes,
        statusRes,
        remarks1Res,
        remarks2Res
      ] = await Promise.all([
        getDoctorsList(),
        getAgentList(),
        getDepartmentsList(),
        getProceduresList(),
        getSelectStatuses(),
        getSelectRemarks1(),
        getSelectRemarks2(),
      ]);
      setDoctors(Array.isArray(docRes?.data) ? docRes.data : []);
      setAgents(Array.isArray(agentRes?.data) ? agentRes.data : []);
      setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : []);
      setProcedures(Array.isArray(procRes?.data) ? procRes.data : []);
      setStatuses(
        Array.isArray(statusRes?.data)
          ? statusRes.data.map((s) => ({ id: s.value, name: s.label }))
          : []
      );
      setRemarks1(
        Array.isArray(remarks1Res?.data)
          ? remarks1Res.data.map((r) => ({ id: r.value, name: r.label }))
          : []
      );
      setRemarks2(
        Array.isArray(remarks2Res?.data)
          ? remarks2Res.data.map((r) => ({ id: r.value, name: r.label }))
          : []
      );
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
        apiFilters.patient_name,
        apiFilters.contact_number,
        apiFilters.status_id,
        apiFilters.remarks_1_id,
        apiFilters.remarks_2_id,
        apiFilters.payment_mode,
        apiFilters.order_by,
        apiFilters.order_direction,
        apiFilters.isBooking
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

  const handleDateRangeClick = (event) => {
    setDateRangeAnchor(event.currentTarget);
  };

  const handleDateRangeClose = () => {
    setDateRangeAnchor(null);
  };

  const handleDateRangeChange = (ranges) => {
    const { selection } = ranges;
    setDateRange([selection]);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFilters(prev => ({
      ...prev,
      start_date: formatDate(selection.startDate),
      end_date: formatDate(selection.endDate)
    }));
  };

  const formatDateDisplay = (start, end) => {
    if (!start || !end) return "Select Date Range";
    return `${start} to ${end}`;
  };

  const clearFilters = () => {
    setDateRange([{
      startDate: null,
      endDate: null,
      key: 'selection'
    }]);
    setFilters({
      start_date: "",
      end_date: "",
      doctor_id: "",
      agent_id: "",
      department_id: "",
      procedure_id: "",
      patient_name: "",
      contact_number: "",
      status_id: "",
      remarks_1_id: "",
      remarks_2_id: "",
      payment_mode: "",
      order_by: "created_at",
      order_direction: "desc",
    });
    setPage(0);
  };

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={{ xs: 1.5, sm: 0 }}
        mb={{ xs: 2, sm: 2 }}
      >
        <Typography
          variant="h5"
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
          Appointments
        </Typography>
        <Box display="flex" gap={2}>
          {hasPermission(MODULES.APPOINTMENTS, PERMISSIONS.CREATE) && (
            <Button
              variant="contained"
              onClick={handleCreateAppointment}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              + Add Appointment
            </Button>
          )}
        </Box>
      </Box>

      {/* Inline Filters */}
      <Paper sx={{ mb: 2, p: { xs: 1.5, sm: 2 } }}>
        <Stack spacing={2}>
          {/* First Row - 6 Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Date Range Picker */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleDateRangeClick}
                startIcon={<CalendarTodayIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  bgcolor: 'background.paper',
                  color: filters.start_date && filters.end_date ? 'text.primary' : 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                {formatDateDisplay(filters.start_date, filters.end_date)}
              </Button>

              <Popover
                open={Boolean(dateRangeAnchor)}
                anchorEl={dateRangeAnchor}
                onClose={handleDateRangeClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    p: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                  },
                }}
              >
                <DateRangePicker
                  onChange={handleDateRangeChange}
                  ranges={dateRange}
                  months={2}
                  direction="horizontal"
                  showMonthAndYearPickers={true}
                  rangeColors={['#3f51b5']}
                />
                <Box display="flex" justifyContent="flex-end" mt={2} gap={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        start_date: "",
                        end_date: ""
                      }));
                      setDateRange([{
                        startDate: null,
                        endDate: null,
                        key: 'selection'
                      }]);
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleDateRangeClose}
                  >
                    Apply
                  </Button>
                </Box>
              </Popover>
            </Box>

            {/* Patient Name */}
            <TextField
              label="Patient Name"
              value={filters.patient_name}
              onChange={(e) => handleFilterChange("patient_name", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />

            {/* Doctor */}
            <Autocomplete
              options={doctors}
              getOptionLabel={(option) => option.name || ""}
              value={doctors.find((d) => d.id === filters.doctor_id) || null}
              onChange={(e, value) => handleFilterChange("doctor_id", value?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Doctor" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1 }}
            />

            {/* Contact Number */}
            <TextField
              label="Contact Number"
              value={filters.contact_number}
              onChange={(e) => handleFilterChange("contact_number", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            />

            {/* Agent (if not current user) */}
            {!isCurrentUserAgent && (
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
                sx={{ flex: 1 }}
              />
            )}

            {/* Department */}
            <TextField
              select
              label="Department"
              value={filters.department_id}
              onChange={(e) => handleFilterChange("department_id", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Second Row - 5 Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Procedure */}
            <Autocomplete
              options={procedures}
              getOptionLabel={(option) => option.name || ""}
              value={procedures.find((p) => p.id === filters.procedure_id) || null}
              onChange={(e, value) => handleFilterChange("procedure_id", value?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Procedure" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1 }}
            />

            {/* Status */}
            <TextField
              select
              label="Status"
              value={filters.status_id}
              onChange={(e) => handleFilterChange("status_id", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Remarks #1 */}
            <TextField
              select
              label="Remarks #1"
              value={filters.remarks_1_id}
              onChange={(e) => handleFilterChange("remarks_1_id", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="">All Remarks #1</MenuItem>
              {remarks1.map((remark) => (
                <MenuItem key={remark.id} value={remark.id}>
                  {remark.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Remarks #2 */}
            <TextField
              select
              label="Remarks #2"
              value={filters.remarks_2_id}
              onChange={(e) => handleFilterChange("remarks_2_id", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="">All Remarks #2</MenuItem>
              {remarks2.map((remark) => (
                <MenuItem key={remark.id} value={remark.id}>
                  {remark.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Payment Method */}
            <TextField
              select
              label="Payment Method"
              value={filters.payment_method}
              onChange={(e) => handleFilterChange("payment_method", e.target.value)}
              size="small"
              sx={{ flex: 1 }}
            >
              <MenuItem value="">All Payment Methods</MenuItem>
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Actions Row */}
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            gap={{ xs: 2, sm: 2 }}
            mt={1}
          >
            <Box
              display="flex"
              gap={{ xs: 1.5, sm: 2 }}
              alignItems="center"
              flexDirection={{ xs: 'column', sm: 'row' }}
              width={{ xs: '100%', sm: 'auto' }}
            >
              {/* Toggle Switch */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: '50px',
                  p: 0.5,
                  position: 'relative',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05) inset',
                  border: '1px solid',
                  borderColor: 'divider',
                  height: { xs: 44, sm: 40 },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: 240 },
                  maxWidth: { xs: '100%', sm: 300 },
                }}
              >
                {/* Sliding background */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: 4,
                    top: '50%',
                    transform: filters.isBooking
                      ? 'translate(calc(100% + 2px), -50%)'
                      : 'translateY(-50%)',
                    width: 'calc(50% - 6px)',
                    height: { xs: 36, sm: 32 },
                    bgcolor: 'background.paper',
                    borderRadius: '50px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />

                {/* Appt. Date Button */}
                <Button
                  onClick={() => handleFilterChange('isBooking', false)}
                  disableRipple
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    minWidth: { xs: 'auto', sm: 140 },
                    height: { xs: 36, sm: 32 },
                    px: { xs: 2, sm: 2.5 },
                    mx: 0.5,
                    flex: 1,
                    borderRadius: '50px',
                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                    fontWeight: !filters.isBooking ? 600 : 400,
                    color: !filters.isBooking ? 'primary.main' : 'text.secondary',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: !filters.isBooking ? 'primary.dark' : 'text.primary',
                    },
                  }}
                >
                  Appt. Date
                </Button>

                {/* Booking Date Button */}
                <Button
                  onClick={() => handleFilterChange('isBooking', true)}
                  disableRipple
                  sx={{
                    position: 'relative',
                    zIndex: 2,
                    minWidth: { xs: 'auto', sm: 140 },
                    height: { xs: 36, sm: 32 },
                    px: { xs: 2, sm: 2.5 },
                    mx: 0.5,
                    flex: 1,
                    borderRadius: '50px',
                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                    fontWeight: filters.isBooking ? 600 : 400,
                    color: filters.isBooking ? 'primary.main' : 'text.secondary',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: filters.isBooking ? 'primary.dark' : 'text.primary',
                    },
                  }}
                >
                  Booking Date
                </Button>
              </Box>
            </Box>

            {/* Clear Filters Button */}
            <Button
              variant="outlined"
              color="error"
              onClick={clearFilters}
              size="small"
              fullWidth={{ xs: true, sm: false }}
              sx={{
                height: { xs: 44, sm: 40 },
                px: { xs: 3, sm: 4 },
                whiteSpace: "nowrap",
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                fontWeight: 500,
                order: { xs: 2, sm: 0 },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={{ xs: 2, sm: 3 }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: { xs: 500, sm: 600, md: 700 } }}>
              <Table stickyHeader sx={{ minWidth: { xs: 800, sm: "auto" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Sr#
                    </TableCell>
                    <TableCell
                      sortDirection={filters.order_by === 'date' ? filters.order_direction : false}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      <TableSortLabel
                        active={filters.order_by === 'date'}
                        direction={filters.order_direction}
                        onClick={() => {
                          const direction = filters.order_by === 'date' && filters.order_direction === 'asc' ? 'desc' : 'asc';
                          handleFilterChange('order_by', 'date');
                          handleFilterChange('order_direction', direction);
                        }}
                      >
                        Appointment Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={filters.order_by === 'created_at' ? filters.order_direction : false}
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      <TableSortLabel
                        active={filters.order_by === 'created_at'}
                        direction={filters.order_direction}
                        onClick={() => {
                          const direction = filters.order_by === 'created_at' && filters.order_direction === 'asc' ? 'desc' : 'asc';
                          handleFilterChange('order_by', 'created_at');
                          handleFilterChange('order_direction', direction);
                        }}
                      >
                        Booking Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Start Time
                    </TableCell>

                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      End Time
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Location
                    </TableCell>
                    {/* <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Appt. ID</TableCell> */}
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Patient
                    </TableCell>

                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Contact
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Doctor
                    </TableCell>
                    {!isCurrentUserAgent && (
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Agent
                      </TableCell>
                    )}
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Procedure
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Department
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Source
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Remarks#1
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Remarks#2
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      MOP
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Actions
                    </TableCell>
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
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          {page * rowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {dayjs(appt.date).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {dayjs(appt.created_at).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.start_time}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.end_time}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{appt.location}</TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.patient_name}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.contact_number}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.doctor?.name}
                        </TableCell>
                        {!isCurrentUserAgent && (
                          <TableCell
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                          >
                            {appt.agent?.name}
                          </TableCell>
                        )}
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {Array.isArray(appt.procedures) &&
                            appt.procedures.length > 0
                            ? appt.procedures.map((p) => p.name).join(", ")
                            : appt.procedure?.name || "-"}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.department?.name}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.source?.name}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.status?.name}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.remarks1?.name}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.remarks2?.name}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.amount}
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {appt.payment_mode}
                        </TableCell>
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
                      <TableCell
                        colSpan={isCurrentUserAgent ? 12 : 13}
                        align="center"
                      >
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
