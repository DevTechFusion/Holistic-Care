import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import {
  getPharmacy,
  getFilteredPharmacy,
  deletePharmacy,
} from "../../DAL/pharmacy";
import ActionButtons from "../../constants/actionButtons";
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
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import PharmacyForm from "../../components/forms/PharmacyForm";

const PharmacyList = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  // 🔹 Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  // 🔹 Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 🔹 Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // 🔹 Fetch Pharmacies
  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    try {
      let res;

      // If date range or search → use getFilteredPharmacy
      if (startDate || endDate || debouncedSearch) {
        res = await getFilteredPharmacy(
          agentId || "",
          startDate ? dayjs(startDate).format("YYYY-MM-DD") : "",
          endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
          debouncedSearch || ""
        );
        setData(res?.data?.data || []);
        setTotal(res?.data?.total || (res?.data?.data?.length ?? 0));
      } else {
        // Otherwise use getPharmacy (with pagination + status)
        res = await getPharmacy(page + 1, rowsPerPage, agentId || "", status || "");
        setData(res?.data?.data || []);
        setTotal(res?.data?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch pharmacies", err);
      enqueueSnackbar("Failed to fetch pharmacies", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, agentId, status, startDate, endDate, debouncedSearch, enqueueSnackbar]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  // 🔹 Delete
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deletePharmacy(id);
      enqueueSnackbar("Pharmacy record deleted successfully", {
        variant: "success",
      });
      fetchPharmacies();
    } catch (err) {
      console.error("Failed to delete pharmacy record", err);
      enqueueSnackbar("Failed to delete pharmacy record", { variant: "error" });
      setLoading(false);
    }
  };

  // 🔹 Edit
  const handleEdit = (record) => {
    setSelectedPharmacy(record);
    setOpenModal(true);
  };

  // 🔹 Close Modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPharmacy(null);
    fetchPharmacies();
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Pharmacy List
        </Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Pharmacy Record
        </Button>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          label="Search (name/phone)"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          label="Status"
          select
          size="small"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
        <TextField
          label="Agent ID"
          size="small"
          value={agentId}
          onChange={(e) => {
            setAgentId(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 120 }}
        />
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newVal) => setStartDate(newVal)}
          slotProps={{ textField: { size: "small" } }}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newVal) => setEndDate(newVal)}
          slotProps={{ textField: { size: "small" } }}
        />
      </Stack>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>MR Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.patient_name}</TableCell>
                    <TableCell>{item.phone_number}</TableCell>
                    <TableCell>{item.pharmacy_mr_number}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.agent_id}</TableCell>
                    <TableCell>
                      <ActionButtons
                        handleEdit={() => handleEdit(item)}
                        handleDelete={() => handleDelete(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No pharmacy records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[15, 25, 50, 100]}
      />

      {/* Modal */}
      <PharmacyForm
        open={openModal}
        onClose={handleCloseModal}
        isEditing={!!selectedPharmacy}
        data={selectedPharmacy}
      />
    </Box>
  );
};

export default PharmacyList;
