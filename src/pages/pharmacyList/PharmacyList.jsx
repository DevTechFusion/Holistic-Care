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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import PharmacyForm from "../../components/forms/PharmacyForm";

const PharmacyList = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [totalIncentive, setTotalIncentive] = useState(0);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // ✅ State for description modal
  const [selectedDescription, setSelectedDescription] = useState("");
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

  const handleOpenDescription = (desc) => {
    setSelectedDescription(desc || "");
    setDescriptionModalOpen(true);
  };

  const handleCloseDescription = () => {
    setSelectedDescription("");
    setDescriptionModalOpen(false);
  };

  const handleCopyDescription = async () => {
    try {
      await navigator.clipboard.writeText(selectedDescription);
      enqueueSnackbar("Description copied to clipboard!", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Failed to copy description", { variant: "error" });
    }
  };

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Pharmacies
  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (startDate || endDate || debouncedSearch) {
        res = await getFilteredPharmacy(
          agentId || "",
          startDate ? dayjs(startDate).format("YYYY-MM-DD") : "",
          endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
          debouncedSearch || ""
        );
      } else {
        res = await getPharmacy(page + 1, rowsPerPage, agentId || "", status || "");
      }

      setData(res?.data?.data || []);
      setTotal(res?.data?.total || (res?.data?.data?.length ?? 0));
      setTotalIncentive(res?.total_incentive || 0);
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

  // Delete
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deletePharmacy(id);
      enqueueSnackbar("Pharmacy record deleted successfully", { variant: "success" });
      fetchPharmacies();
    } catch (err) {
      console.error("Failed to delete pharmacy record", err);
      enqueueSnackbar("Failed to delete pharmacy record", { variant: "error" });
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (record) => {
    setSelectedPharmacy(record);
    setOpenModal(true);
  };

  // Close Modal
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

        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" sx={{ fontWeight: "bold" }} disableElevation>
            Total Incentive: {Number(totalIncentive).toFixed(2)}
          </Button>

          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Pharmacy Record
          </Button>
        </Stack>
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
      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Sr#</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>MR Number</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Agent ID</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{dayjs(item.date).format("DD-MM-YYYY")}</TableCell>
                    <TableCell>{item.patient_name}</TableCell>
                    <TableCell>{item.phone_number}</TableCell>
                    <TableCell>{item.pharmacy_mr_number}</TableCell>
                    <TableCell>{item.agent?.name || "—"}</TableCell>
                    <TableCell>{item.agent?.id || "—"}</TableCell>

                    {/* ✅ Description cell with modal trigger */}
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        color: "primary.main",
                      }}
                      onClick={() => handleOpenDescription(item.description)}
                      title="Click to view full description"
                    >
                      {item.description || "—"}
                    </TableCell>

                    <TableCell>{item.amount}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      <ActionButtons
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
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

      {/* ✅ Description Modal */}
      <Dialog open={descriptionModalOpen} onClose={handleCloseDescription} maxWidth="sm" fullWidth>
        <DialogTitle>
          Pharmacy Description
          <IconButton onClick={handleCopyDescription} size="small" sx={{ ml: 1 }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {selectedDescription}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDescription} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PharmacyList;
