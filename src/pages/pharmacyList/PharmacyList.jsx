import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { getPharmacy, deletePharmacy } from "../../DAL/pharmacy";
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
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dayjs from "dayjs";
import PharmacyForm from "../../components/forms/PharmacyForm";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getAgentList } from "../../DAL/users";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const PharmacyList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [totalIncentive, setTotalIncentive] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const { hasPermission } = useAuth();

  // filters (removed search)
  const [filters, setFilters] = useState({
    // status: "",
    agent_id: "",
    start_date: null,
    end_date: null,
  });

  // lists for inline filters
  const [agents, setAgents] = useState([]);
  // const [statuses, setStatuses] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);

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
      enqueueSnackbar("Description copied to clipboard!", {
        variant: "success",
      });
    } catch (err) {
      enqueueSnackbar("Failed to copy description", { variant: "error" });
    }
  };

  const fetchFilterLists = async () => {
    setListsLoading(true);
    try {
      const [agentRes, statusRes] = await Promise.all([
        getAgentList(),
        // getSelectStatuses(),
      ]);
      setAgents(Array.isArray(agentRes?.data) ? agentRes.data : []);
      // setStatuses(Array.isArray(statusRes?.data) ? statusRes.data : []);
    } catch (err) {
      console.error("Failed to fetch filter lists", err);
      setAgents([]);
      // setStatuses([]);
    } finally {
      setListsLoading(false);
    }
  };

  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPharmacy(
        page + 1,
        rowsPerPage,
        filters.agent_id || "",
        // filters.status || "",
        filters.start_date
          ? dayjs(filters.start_date).format("YYYY-MM-DD")
          : "",
        filters.end_date ? dayjs(filters.end_date).format("YYYY-MM-DD") : ""
      );

      setData(res?.data?.data || []);
      setTotal(res?.data?.total || (res?.data?.data?.length ?? 0));
      setTotalIncentive(res?.total_incentive || 0);
    } catch (err) {
      console.error("Failed to fetch pharmacies", err);
      enqueueSnackbar("Failed to fetch pharmacies", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, enqueueSnackbar]);

  useEffect(() => {
    fetchFilterLists();
  }, []);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const handleDelete = async (id) => {
    try {
      const res = await deletePharmacy(id);

      if (res?.status === "error" || (res?.code && res.code !== 200)) {
        enqueueSnackbar(res.message || "Failed to delete pharmacy record", {
          variant: "error",
        });
        return;
      }

      enqueueSnackbar("Pharmacy record deleted successfully", {
        variant: "success",
      });

      fetchPharmacies();
    } catch (error) {
      console.error("Failed to delete pharmacy record:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete pharmacy record";

      enqueueSnackbar(message, { variant: "error" });
    } finally {
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

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value || "" }));
    setPage(0);
  };

  const clearFilters = () => {
    const cleared = {
      // status: "",
      agent_id: "",
      start_date: null,
      end_date: null,
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
          Pharmacy List
        </Typography>

        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          {hasPermission(MODULES.PHARMACY, PERMISSIONS.TOTAL_INCENTIVE) && (
            <Button
              variant="contained"
              sx={{ fontWeight: "bold", width: { xs: "100%", sm: "auto" } }}
              disableElevation
            >
              Total Incentive: {Number(totalIncentive).toFixed(2)}
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            + Add Pharmacy Record
          </Button>
        </Stack>
      </Box>

      {/* Inline Filters (moved from popover) */}
      <Paper sx={{ mb: 2, p: { xs: 1.5, sm: 2 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          {/* Agent Autocomplete */}
          <Autocomplete
            options={agents}
            getOptionLabel={(option) => option.name || ""}
            value={agents.find((a) => a.id === filters.agent_id) || null}
            onChange={(e, value) => handleFilterChange("agent_id", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Agent"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {listsLoading ? (
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(o, v) => o?.id === v?.id}
            disablePortal
            sx={{ flex: 1, minWidth: 240 }}
          />

          {/* Date Filters */}
          <DatePicker
            label="Start Date"
            value={filters.start_date || null}
            onChange={(val) => handleFilterChange("start_date", val)}
            slotProps={{
              textField: {
                size: "small",
                sx: { flex: 1, minWidth: 180 },
              },
            }}
          />

          <DatePicker
            label="End Date"
            value={filters.end_date || null}
            onChange={(val) => handleFilterChange("end_date", val)}
            slotProps={{
              textField: {
                size: "small",
                sx: { flex: 1, minWidth: 180 },
              },
            }}
          />

          {/* Clear Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              width: { xs: "100%", md: "auto" },
              ml: { xs: 0, md: "auto" },
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={clearFilters}
              size="small"
            >
              Clear
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={{ xs: 2, sm: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table fixed sx={{ minWidth: { xs: 700, sm: "auto" } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Sr#</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Date</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Patient</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Phone</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Agent</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Description</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Amount</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Payment</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item, idx) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        {dayjs(item.date).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{item.patient_name}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{item.phone_number}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{item.agent?.name || "—"}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 250,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          color: "primary.main",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                        onClick={() => handleOpenDescription(item.description)}
                        title="Click to view full description"
                      >
                        {item.description || "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{item.amount}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{item.payment_mode || "Paid"}</TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={
                            hasPermission(MODULES.PHARMACY, PERMISSIONS.EDIT)
                              ? () => handleEdit(item)
                              : null
                          }
                          onDelete={
                            hasPermission(MODULES.PHARMACY, PERMISSIONS.DELETE)
                              ? () => handleDelete(item.id)
                              : null
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No pharmacy records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

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
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Pharmacy Form Modal */}
      <PharmacyForm
        open={openModal}
        onClose={handleCloseModal}
        isEditing={!!selectedPharmacy}
        data={selectedPharmacy}
      />

      {/* Description Modal */}
      <Dialog
        open={descriptionModalOpen}
        onClose={handleCloseDescription}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Pharmacy Description
          <IconButton
            onClick={handleCopyDescription}
            size="small"
            sx={{ ml: 1 }}
          >
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
