import { useEffect, useState, useCallback } from "react";
import {
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
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission } = useAuth();

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
  const [listsLoading, setListsLoading] = useState(false);

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
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Reports List</Typography>
        <Box display="flex" gap={2}>
          {hasPermission(MODULES.REPORTS, PERMISSIONS.EXPORT) && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </Button>
          )}
        </Box>
      </Box>

      {/* Inline Filters */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <Stack spacing={2}>
          {/* === Row 1: 3 Fields === */}
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

          {/* === Row 2: 3 Fields === */}
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
              sx={{ flex: 1, minWidth: 200 }}
            />
          </Stack>

          {/* === Row 3: 4 Fields + Right-Aligned Clear Button === */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
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
              sx={{ flex: 1, minWidth: 200 }}
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
              sx={{ flex: 1, minWidth: 200 }}
            />

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
              sx={{ flex: 1, minWidth: 200 }}
            />

            {/* Last field + Clear Button aligned to right */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "flex-start", md: "flex-end" },
                flex: 1,
                minWidth: 200,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <Autocomplete
                  options={paymentModes}
                  getOptionLabel={(option) => option.name || ""}
                  value={
                    paymentModes.find((p) => p.id === filters.payment_mode) ||
                    null
                  }
                  onChange={(e, value) =>
                    handleFilterChange("payment_mode", value?.id)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Payment Mode" size="small" />
                  )}
                  isOptionEqualToValue={(o, v) => o?.id === v?.id}
                  disablePortal
                  sx={{ flex: 1, minWidth: 200 }}
                />

                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearFilters}
                  size="small"
                  sx={{
                    whiteSpace: "nowrap",
                    alignSelf: { xs: "flex-start", md: "center" },
                    ml: { md: "auto" },
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 700 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Sr#</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Procedure</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Remarks_1</TableCell>
                    <TableCell>Remarks_2</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment</TableCell>
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
                          "&:hover": { backgroundColor: bgColor, opacity: 0.9 },
                        }}
                      >
                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            backgroundColor: bgColor,
                            fontWeight: 500,
                          }}
                        >
                          {page * rowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell>
                          {dayjs(rep.appointment?.date).format("DD-MM-YYYY")}
                        </TableCell>
                        <TableCell>{rep.appointment?.patient_name}</TableCell>
                        <TableCell>{rep.appointment?.contact_number}</TableCell>
                        <TableCell>{rep.appointment?.doctor?.name}</TableCell>
                        <TableCell>
                          {rep.appointment?.procedures
                            ?.map((p) => p.name)
                            .join(", ")}
                        </TableCell>
                        <TableCell>
                          {rep.appointment?.department?.name}
                        </TableCell>
                        <TableCell>{rep.appointment?.agent?.name}</TableCell>
                        <TableCell>{rep.appointment?.source?.name}</TableCell>
                        <TableCell>{rep.remarks1?.name}</TableCell>
                        <TableCell>{rep.remarks2?.name}</TableCell>
                        <TableCell>{status}</TableCell>
                        <TableCell>{rep.amount}</TableCell>
                        <TableCell>{rep.appointment?.payment_mode}</TableCell>
                      </TableRow>
                    );
                  })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={13} align="center">
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
