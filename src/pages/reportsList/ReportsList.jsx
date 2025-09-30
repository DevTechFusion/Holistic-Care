import { useEffect, useState } from "react";
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
} from "@mui/material";

import { getAllReports, exportReports } from "../../DAL/reports";
import { getAllStatuses } from "../../DAL/status";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import ReportsFilterPopover from "./ReportsFilterPopover";
import { useAuth } from "../../contexts/AuthContext"; 

const statusColors = {
  "Already Taken": "#e7f2fe",
  Arrived: "#b3e5ca",
  Cancelled: "#f99f9f",
  "Not Show": "#FFE4F7",
  Rescheduled: "#FFFEE0",
};

const ReportsPage = () => {
  const { user } = useAuth(); // ✅ GET USER
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [statuses, setStatuses] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    doctor_id: "",
    agent_id: "",
    department_id: "",
    procedure_id: "",
    status: "",
    payment_mode: "",
    order_by: "created_at",
    order_direction: "desc",
  });

  // ✅ Fetch statuses
  const fetchStatuses = async () => {
    try {
      const res = await getAllStatuses();
      setStatuses(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch statuses", err);
    }
  };

  // ✅ Fetch reports (pagination-aware & agent-specific)
  const fetchReports = async () => {
    try {
      setLoading(true);

      let apiFilters = { ...filters };

      // ✅ If agent, restrict reports
      if (user?.roles?.[0]?.name === "agent") {
        apiFilters.agent_id = user.id;
      }

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
        apiFilters.payment_mode,
        apiFilters.order_by,
        apiFilters.order_direction
      );

      setReports(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, filters, user]);

  // ✅ Handle CSV export (agent-aware)
  const handleExport = async () => {
    try {
      setExporting(true);

      let apiFilters = { ...filters };

      if (user?.roles?.[0]?.name === "agent") {
        apiFilters.agent_id = user.id;
      }

      const res = await exportReports(
        apiFilters.start_date,
        apiFilters.end_date,
        apiFilters.doctor_id,
        apiFilters.agent_id,
        apiFilters.department_id,
        apiFilters.procedure_id,
        apiFilters.status,
        apiFilters.payment_mode,
        apiFilters.order_by,
        apiFilters.order_direction
      );

      const blob =
        res.data instanceof Blob
          ? res.data
          : new Blob([res.data], { type: "text/csv;charset=utf-8;" });

      const contentDisposition =
        res.headers?.["content-disposition"] || res.headers?.get?.("content-disposition");

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

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Reports List</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={(e) => setAnchorEl(anchorEl ? null : e.currentTarget)}
          >
            Filters
          </Button>
          <Button variant="contained" color="primary" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </Box>
      </Box>

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
                    <TableCell>MOP</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((rep, idx) => {
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
                        <TableCell>{dayjs(rep.appointment?.date).format("DD-MM-YYYY")}</TableCell>
                        <TableCell>{rep.appointment?.patient_name}</TableCell>
                        <TableCell>{rep.appointment?.contact_number}</TableCell>
                        <TableCell>{rep.appointment?.doctor?.name}</TableCell>
                        <TableCell>{rep.appointment?.procedures?.map((p) => p.name).join(", ")}</TableCell>
                        <TableCell>{rep.appointment?.department?.name}</TableCell>
                        <TableCell>{rep.appointment?.agent?.name}</TableCell>
                        <TableCell>{rep.appointment?.source?.name}</TableCell>
                        <TableCell>{rep.remarks1?.name}</TableCell>
                        <TableCell>{rep.remarks2?.name}</TableCell>
                        <TableCell>{status}</TableCell>
                        <TableCell>{rep.amount}</TableCell>
                        <TableCell>{rep.appointment?.payment_mode}</TableCell>
                      </TableRow>
                    );
                  })}
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

      {/* Reports Filter Popover */}
      <ReportsFilterPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        filters={filters}
        setFilters={setFilters}
        statuses={statuses}
      />
    </Box>
  );
};

export default ReportsPage;
