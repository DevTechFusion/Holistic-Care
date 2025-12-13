import { useEffect, useState, useCallback, useRef } from "react";

import {
  Grid,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Box,
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
  Button,
  Stack,
  TextField,
  Autocomplete,
  MenuItem,
  TableSortLabel,
  Popover,
  IconButton,
} from "@mui/material";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';

import { getAllReports, exportReports } from "../../DAL/reports";
import { getDoctorsList } from "../../DAL/doctors";
import { getProceduresList } from "../../DAL/procedure";
import { getDepartmentsList } from "../../DAL/departments";
import { getAgentList } from "../../DAL/users";
import { getSelectStatuses } from "../../DAL/status";
import { getSelectRemarks1 } from "../../DAL/remarks1";
import { getSelectRemarks2 } from "../../DAL/remarks2";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const statusColors = {
  "Already Taken": "#e7f2fe",
  Arrived: "#b3e5ca",
  Cancelled: "#f99f9f",
  "Not Show": "#FFE4F7",
  Rescheduled: "#FFFEE0",
};

const paymentModes = [
  { id: "cash", name: "Cash" },
  { id: "card", name: "Card" },
  { id: "online", name: "Online" },
  { id: "not_paid", name: "Not Paid" },
];

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission, user } = useAuth();
  
  // Check if current user is an agent
  const isCurrentUserAgent = Array.isArray(user?.roles) && user.roles.some((role) => role.name?.toLowerCase() === "agent");

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
    status: "",
    remarks_1_id: "",
    remarks_2_id: "",
    payment_mode: "",
    patient_name: "",
    contact_number: "",
    order_by: "created_at",
    order_direction: "desc",
    isBooking: false,
  });

  // lists for inline filters
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [remarks1, setRemarks1] = useState([]);
  const [remarks2, setRemarks2] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  console.log("metrics", metrics);

  const fetchFilterLists = useCallback(async () => {
    setListsLoading(true);
    try {
      const [
        docRes,
        agentRes,
        deptRes,
        procRes,
        statusRes,
        remarks1Res,
        remarks2Res,
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
      console.error("Error fetching report filter lists:", err);
      setDoctors([]);
      setAgents([]);
      setDepartments([]);
      setProcedures([]);
      setStatuses([]);
      setRemarks1([]);
      setRemarks2([]);
    } finally {
      setListsLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);

      let apiFilters = { ...filters };

      const res = await getAllReports(
        page + 1,
        rowsPerPage,
        apiFilters.start_date,
        apiFilters.end_date,
        apiFilters.isBooking,
        apiFilters.doctor_id,
        apiFilters.agent_id,
        apiFilters.department_id,
        apiFilters.procedure_id,
        apiFilters.status,
        apiFilters.remarks_1_id,
        apiFilters.remarks_2_id,
        apiFilters.payment_mode,
        apiFilters.order_by,
        apiFilters.order_direction,
        apiFilters.patient_name,
        apiFilters.contact_number
      );

      setReports(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
      setMetrics(res?.metrics || {});
    } catch (err) {
      console.error("Failed to fetch reports", err);
      enqueueSnackbar?.("Failed to fetch reports", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, enqueueSnackbar]);

  useEffect(() => {
    fetchFilterLists();
  }, [fetchFilterLists]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, page, rowsPerPage, filters]);

  const handleExport = async () => {
    try {
      setExporting(true);

      let apiFilters = { ...filters };

      const res = await exportReports(
        apiFilters.start_date,
        apiFilters.end_date,
        apiFilters.isBooking,
        apiFilters.doctor_id,
        apiFilters.agent_id,
        apiFilters.department_id,
        apiFilters.procedure_id,
        apiFilters.status,
        apiFilters.remarks_1_id,
        apiFilters.remarks_2_id,
        apiFilters.payment_mode,
        apiFilters.order_by,
        apiFilters.order_direction,
        apiFilters.patient_name,
        apiFilters.contact_number
      );

      const blob =
        res.data instanceof Blob
          ? res.data
          : new Blob([res.data], { type: "text/csv;charset=utf-8;" });

      const contentDisposition =
        res.headers?.["content-disposition"] ||
        res.headers?.get?.("content-disposition");

      const filename =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        `reports_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("CSV download started", { variant: "success" });
    } catch (err) {
      console.error("CSV export failed", err);
      enqueueSnackbar("Failed to download CSV", { variant: "error" });
    } finally {
      setExporting(false);
    }
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
    const cleared = {
      start_date: "",
      end_date: "",
      doctor_id: "",
      agent_id: "",
      department_id: "",
      procedure_id: "",
      status: "",
      remarks_1_id: "",
      remarks_2_id: "",
      payment_mode: "",
      patient_name: "",
      contact_number: "",
      order_by: "created_at",
      order_direction: "desc",
      isBooking: false,
    };
    setFilters(cleared);
    setDateRange([{
      startDate: null,
      endDate: null,
      key: 'selection'
    }]);
    setPage(0);
  };

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      {/* Header */}
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
          Reports List
        </Typography>
        <Box display="flex" gap={2}>
          {hasPermission(MODULES.REPORTS, PERMISSIONS.EXPORT) && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              disabled={exporting}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Inline Filters */}
      <Paper sx={{ mb: 2, p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
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

            {/* Contact Number */}
            <TextField
              label="Contact Number"
              value={filters.contact_number}
              onChange={(e) => handleFilterChange("contact_number", e.target.value)}
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
          </Stack>

          {/* Second Row - 5 Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
            <Autocomplete
              options={statuses}
              getOptionLabel={(option) => option.name || ""}
              value={statuses.find((s) => s.id === filters.status) || null}
              onChange={(e, value) => handleFilterChange("status", value?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Status" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1 }}
            />

            {/* Remarks #1 */}
            <Autocomplete
              options={remarks1}
              getOptionLabel={(option) => option.name || ""}
              value={remarks1.find((r) => r.id === filters.remarks_1_id) || null}
              onChange={(e, value) => handleFilterChange("remarks_1_id", value?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Remark 1" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1 }}
            />

            {/* Remarks #2 */}
            <Autocomplete
              options={remarks2}
              getOptionLabel={(option) => option.name || ""}
              value={remarks2.find((r) => r.id === filters.remarks_2_id) || null}
              onChange={(e, value) => handleFilterChange("remarks_2_id", value?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Remark 2" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1 }}
            />

            {/* Payment Method */}
            <Autocomplete
              options={paymentModes}
              getOptionLabel={(option) => option.name || ""}
              value={paymentModes.find((p) => p.id === filters.payment_mode) || null}
              onChange={(e, value) => handleFilterChange("payment_mode", value?.id)}
              renderInput={(params) => (
                <TextField {...params} label="Payment Method" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{ flex: 1 }}
            />
          </Stack>

          {/* Action Buttons */}
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

      {/* Table */}
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
            {!isCurrentUserAgent && (
              <Grid
                container
                spacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{ p: { xs: 2, sm: 2, md: 3 } }}
              >
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Card
                    sx={{
                      backgroundColor: "#F7F7F7",
                      boxShadow: 3,
                      borderRadius: "12px",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          textAlign: "center",
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        }}
                      >
                        Arrived Ratio
                      </Typography>
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#23C7B7",
                          fontFamily: '"Inter", sans-serif',
                          fontSize: {
                            xs: "1.25rem",
                            sm: "1.4rem",
                            md: "1.5rem",
                          },
                          fontWeight: 600,
                        }}
                        variant="h5"
                        component="div"
                      >
                        {metrics.arrived_ratio}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Card
                    sx={{
                      backgroundColor: "#F7F7F7",
                      boxShadow: 3,
                      borderRadius: "12px",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          textAlign: "center",
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        }}
                      >
                        Arrived Revenue
                      </Typography>
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#23C7B7",
                          fontFamily: '"Inter", sans-serif',
                          fontSize: {
                            xs: "1.25rem",
                            sm: "1.4rem",
                            md: "1.5rem",
                          },
                          fontWeight: 600,
                        }}
                        variant="h5"
                        component="div"
                      >
                        {metrics.arrived_revenue}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Card
                    sx={{
                      backgroundColor: "#F7F7F7",
                      boxShadow: 3,
                      borderRadius: "12px",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          textAlign: "center",
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        }}
                      >
                        Booked Revenue
                      </Typography>
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#23C7B7",
                          fontFamily: '"Inter", sans-serif',
                          fontSize: {
                            xs: "1.25rem",
                            sm: "1.4rem",
                            md: "1.5rem",
                          },
                          fontWeight: 600,
                        }}
                        variant="h5"
                        component="div"
                      >
                        {metrics.booked_revenue}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Card
                    sx={{
                      backgroundColor: "#F7F7F7",
                      boxShadow: 3,
                      borderRadius: "12px",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          textAlign: "center",
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        }}
                      >
                        Total Agent Booking
                      </Typography>
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#23C7B7",
                          fontFamily: '"Inter", sans-serif',
                          fontSize: {
                            xs: "1.25rem",
                            sm: "1.4rem",
                            md: "1.5rem",
                          },
                          fontWeight: 600,
                        }}
                        variant="h5"
                        component="div"
                      >
                        {metrics.total_agent_booking}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Card
                    sx={{
                      backgroundColor: "#F7F7F7",
                      boxShadow: 3,
                      borderRadius: "12px",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          textAlign: "center",
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        }}
                      >
                        Total Booking
                      </Typography>
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#23C7B7",
                          fontFamily: '"Inter", sans-serif',
                          fontSize: {
                            xs: "1.25rem",
                            sm: "1.4rem",
                            md: "1.5rem",
                          },
                          fontWeight: 600,
                        }}
                        variant="h5"
                        component="div"
                      >
                        {metrics.total_booking}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
                  <Card
                    sx={{
                      backgroundColor: "#F7F7F7",
                      boxShadow: 3,
                      borderRadius: "12px",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: { xs: 2, sm: 2.5, md: 3 },
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontFamily: '"Inter", sans-serif',
                          textAlign: "center",
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        }}
                      >
                        Total Doctor Booking
                      </Typography>
                      <Typography
                        sx={{
                          textAlign: "center",
                          color: "#23C7B7",
                          fontFamily: '"Inter", sans-serif',
                          fontSize: {
                            xs: "1.25rem",
                            sm: "1.4rem",
                            md: "1.5rem",
                          },
                          fontWeight: 600,
                        }}
                        variant="h5"
                        component="div"
                      >
                        {metrics.total_doctor_booking}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            <Paper sx={{ overflowX: "auto" }}>
              <TableContainer sx={{ maxHeight: { xs: 500, sm: 600, md: 700 } }}>
                <Table stickyHeader sx={{ minWidth: { xs: 900, sm: "auto" } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 3,
                          backgroundColor: '#fff',
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          fontWeight: 600,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '1px',
                            backgroundColor: 'rgba(224, 224, 224, 1)',
                          }
                        }}
                      >
                        Sr#
                      </TableCell>
                      <TableCell
                        sortDirection={
                          filters.order_by === "created_at"
                            ? filters.order_direction
                            : false
                        }
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        <TableSortLabel
                          active={filters.order_by === "created_at"}
                          direction={filters.order_direction}
                          onClick={() => {
                            const direction =
                              filters.order_by === "created_at" &&
                              filters.order_direction === "asc"
                                ? "desc"
                                : "asc";
                            handleFilterChange("order_by", "created_at");
                            handleFilterChange("order_direction", direction);
                          }}
                        >
                          Booking Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Appointment Date
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Location
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Patient
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Primary Contact
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        width: '100%' }}
                      >
                        Secondary Contact
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        width: '100%' }}
                      >
                        Doctor
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        width: '100%' }}
                      >
                        Procedure
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        width: '100%' }}
                      >
                        Department
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
                        Source
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Remarks_1
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Remarks_2
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Amount
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Payment
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.length > 0 ? (
                      reports.map((rep, idx) => {
                        const status = rep.status?.name;
                        const bgColor = statusColors[status] || "inherit";
                        return (
                          <TableRow
                            key={rep.id}
                            sx={{
                              backgroundColor: bgColor,
                              "&:hover": {
                                backgroundColor: bgColor,
                                opacity: 0.9,
                              },
                            }}
                          >
                            <TableCell
                              sx={{
                                position: "sticky",
                                left: 0,
                                zIndex: 2,
                                backgroundColor: "#fff",
                                fontWeight: 500,
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  bottom: 0,
                                  width: '1px',
                                  backgroundColor: 'rgba(224, 224, 224, 1)',
                                }
                              }}
                            >
                              {page * rowsPerPage + idx + 1}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {dayjs(rep.appointment?.created_at).format(
                                "DD-MM-YYYY"
                              )}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {dayjs(rep.appointment?.date).format("DD-MM-YYYY")}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.location}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.patient_name}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.contact_number}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.contact_number_2}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.doctor?.name}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.procedures
                                ?.map((p) => p.name)
                                .join(", ")}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.department?.name}
                            </TableCell>
                            {!isCurrentUserAgent && (
                              <TableCell
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                {rep.appointment?.agent?.name}
                              </TableCell>
                            )}
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.source?.name}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.remarks1?.name}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.remarks2?.name}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {status}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.amount}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {rep.appointment?.payment_mode}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={isCurrentUserAgent ? 13 : 14}
                          align="center"
                        >
                          No reports found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

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
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ReportsPage;
