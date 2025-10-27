import { useEffect, useState, useCallback } from "react";

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
} from "@mui/material";

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
  console.log("reports::", reports);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission, user } = useAuth();
  
  // Check if current user is an agent
  const isCurrentUserAgent = Array.isArray(user?.roles) && user.roles.some((role) => role.name?.toLowerCase() === "agent");

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
    order_by: "created_at",
    order_direction: "desc",
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
        apiFilters.doctor_id,
        apiFilters.agent_id,
        apiFilters.department_id,
        apiFilters.procedure_id,
        apiFilters.status,
        apiFilters.remarks_1_id,
        apiFilters.remarks_2_id,
        apiFilters.payment_mode,
        apiFilters.order_by,
        apiFilters.order_direction
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
        apiFilters.doctor_id,
        apiFilters.agent_id,
        apiFilters.department_id,
        apiFilters.procedure_id,
        apiFilters.status,
        apiFilters.remarks_1_id,
        apiFilters.remarks_2_id,
        apiFilters.payment_mode,
        apiFilters.order_by,
        apiFilters.order_direction
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
      order_by: "created_at",
      order_direction: "desc",
    };
    setFilters(cleared);
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
          {/* Row 1: 4 Fields */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              "& > *": {
                flex: 1,
                minWidth: { xs: "100%", sm: 0 },
              },
            }}
          >
            <TextField
              label="Start Date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />

            <TextField
              label="End Date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
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
              fullWidth
            />

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
                fullWidth
              />
            )}
          </Stack>

          {/* Row 2: 4 Fields */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              "& > *": {
                flex: 1,
                minWidth: { xs: "100%", sm: 0 },
              },
            }}
          >
            <TextField
              select
              label="Department"
              value={filters.department_id}
              onChange={(e) =>
                handleFilterChange("department_id", e.target.value)
              }
              size="small"
              fullWidth
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>

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
              fullWidth
            />

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
              fullWidth
            />

            <Autocomplete
              options={remarks1}
              getOptionLabel={(option) => option.name || ""}
              value={
                remarks1.find((r) => r.id === filters.remarks_1_id) || null
              }
              onChange={(e, value) =>
                handleFilterChange("remarks_1_id", value?.id)
              }
              renderInput={(params) => (
                <TextField {...params} label="Remark 1" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              fullWidth
            />
          </Stack>

          {/* Row 3: 2 Fields + Clear Button (Centered) */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Autocomplete
              options={remarks2}
              getOptionLabel={(option) => option.name || ""}
              value={
                remarks2.find((r) => r.id === filters.remarks_2_id) || null
              }
              onChange={(e, value) =>
                handleFilterChange("remarks_2_id", value?.id)
              }
              renderInput={(params) => (
                <TextField {...params} label="Remark 2" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{
                width: { xs: "100%", sm: "calc(25% - 8px)" },
              }}
            />

            <Autocomplete
              options={paymentModes}
              getOptionLabel={(option) => option.name || ""}
              value={
                paymentModes.find((p) => p.id === filters.payment_mode) || null
              }
              onChange={(e, value) =>
                handleFilterChange("payment_mode", value?.id)
              }
              renderInput={(params) => (
                <TextField {...params} label="Payment Mode" size="small" />
              )}
              isOptionEqualToValue={(o, v) => o?.id === v?.id}
              disablePortal
              sx={{
                width: { xs: "100%", sm: "calc(25% - 8px)" },
              }}
            />

            <Button
              variant="outlined"
              color="error"
              onClick={clearFilters}
              size="small"
              sx={{
                height: 40,
                px: 4,
                whiteSpace: "nowrap",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Clear Filters
            </Button>
          </Stack>
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
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
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
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                        fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
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
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                        fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
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
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                        fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
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
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                        fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
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
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                        fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
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
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center", p: { xs: 2, sm: 2.5, md: 3 } }}>
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
                        fontSize: { xs: "1.25rem", sm: "1.4rem", md: "1.5rem" },
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

            <TableContainer sx={{ maxHeight: { xs: 500, sm: 600, md: 700 } }}>
              <Table stickyHeader sx={{ minWidth: { xs: 900, sm: "auto" } }}>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Sr#
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Date
                    </TableCell>
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
                              zIndex: 1,
                              backgroundColor: bgColor,
                              fontWeight: 500,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {page * rowsPerPage + idx + 1}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                          >
                            {dayjs(rep.appointment?.date).format("DD-MM-YYYY")}
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
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
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
                      <TableCell colSpan={isCurrentUserAgent ? 13 : 14} align="center">
                        No reports found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

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
