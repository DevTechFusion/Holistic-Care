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
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dayjs from "dayjs";
import PharmacyForm from "../../components/forms/PharmacyForm";
import PharmacyFilterPopover from "./PharmacyFilterPopover";
import { useAuth } from "../../contexts/AuthContext";

const PharmacyList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [totalIncentive, setTotalIncentive] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    agent_id: "",
    start_date: null,
    end_date: null,
  });

  const [filterAnchor, setFilterAnchor] = useState(null);

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

 
  const handleOpenFilters = (e) => setFilterAnchor(e.currentTarget);
  const handleCloseFilters = () => setFilterAnchor(null);

  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    try {
      let apiFilters = { ...filters };
      if (user?.roles?.[0]?.name?.toLowerCase() === "agent") {
        apiFilters.agent_id = user.id;
      }

      const res = await getPharmacy(
        page + 1,
        rowsPerPage,
        apiFilters.agent_id || "",
        apiFilters.status || "",
        apiFilters.search || "",
        apiFilters.start_date ? dayjs(apiFilters.start_date).format("YYYY-MM-DD") : "",
        apiFilters.end_date ? dayjs(apiFilters.end_date).format("YYYY-MM-DD") : ""
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
  }, [page, rowsPerPage, filters, enqueueSnackbar, user]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">
          Pharmacy List
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            sx={{ fontWeight: "bold" }}
            disableElevation
          >
            Total Incentive: {Number(totalIncentive).toFixed(2)}
          </Button>
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Pharmacy Record
          </Button>
          <Button variant="outlined" onClick={handleOpenFilters}>
            Filters
          </Button>
        </Stack>
      </Box>

      {/* Filter Popover */}
      <PharmacyFilterPopover
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={handleCloseFilters}
        filters={filters}
        setFilters={(newFilters) => {
          setFilters(newFilters);
          setPage(0); 
        }}
      />

      {/* Table */}
      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table fixed>
              <TableHead>
                <TableRow>
                  <TableCell>Sr#</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Agent</TableCell>
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
                      <TableCell>
                        {dayjs(item.date).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell>{item.patient_name}</TableCell>
                      <TableCell>{item.phone_number}</TableCell>
                      <TableCell>{item.agent?.name || "—"}</TableCell>
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