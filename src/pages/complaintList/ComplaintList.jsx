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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackbar } from "notistack";
import ActionButtons from "../../constants/actionButtons";
import { getAllMistakes } from "../../DAL/mistakes";
import ComplaintForm from "../../components/forms/ComplaintForm";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const ComplaintList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("agent");

  const { hasPermission } = useAuth();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getAllMistakes(filterType, page + 1, rowsPerPage);
      setComplaints(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
      enqueueSnackbar("Failed to fetch complaints", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [filterType]);

  useEffect(() => {
    fetchComplaints();
  }, [filterType, page, rowsPerPage]);

  const handleUpdateComplaint = (complaint) => {
    setTargetItem(complaint);
    setComplaintModalOpen(true);
  };

  const handleOpenDescription = (desc) => {
    setSelectedDescription(desc);
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

  // Only show agent or doctor column based on filter
  const showAgent = filterType === "agent";
  const showDoctor = filterType === "doctor";

  // Filter complaints based on presence of doctor_id or agent_id
  const filteredComplaints = complaints.filter((complaint) => {
    if (filterType === "doctor") return !!complaint.doctor_id;
    if (filterType === "agent") return !!complaint.agent_id;
    return true;
  });

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Complaints
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter By</InputLabel>
          <Select
            value={filterType}
            label="Filter By"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="agent">Agent</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr#</TableCell>
                  <TableCell>Appointment ID</TableCell>
                  <TableCell>Complaint Type</TableCell>
                  <TableCell>Description</TableCell>
                  {showDoctor && <TableCell>Doctor</TableCell>}
                  {showAgent && <TableCell>Agent</TableCell>}
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComplaints.length > 0 ? (
                  filteredComplaints.map((complaint, idx) => (
                  <TableRow key={complaint.id || idx}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>
                      {complaint.appointment_id ||
                       complaint.appointment?.id ||
                       "-"}
                    </TableCell>
                    <TableCell>{complaint.complaint_type?.name || "-"}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        color: "primary.main",
                      }}
                      onClick={() => handleOpenDescription(complaint.description)}
                      title="Click to view full description"
                    >
                      {complaint.description}
                    </TableCell>
                    {showDoctor && (
                      <TableCell>
                        {complaint.doctor?.name ||
                         "-"}
                      </TableCell>
                    )}
                    {showAgent && (
                      <TableCell>
                        {complaint.agent?.name ||
                         "-"}
                      </TableCell>
                    )}
                    <TableCell>
                      {complaint.is_resolved ? (
                        <Chip label="Resolved" color="success" size="small" />
                      ) : (
                        <Chip label="Pending" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <ActionButtons onEdit={ hasPermission(MODULES.COMPLAINTS, PERMISSIONS.EDIT) ? () => handleUpdateComplaint(complaint) : null} />
                    </TableCell>
                  </TableRow>
                ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No complaints found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

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
              rowsPerPageOptions={[5, 10, 15, 25]}
            />
          </>
        )}
      </Paper>

      <ComplaintForm
        isEditing={!!targetItem}
        data={targetItem}
        open={complaintModalOpen}
        onClose={() => {
          setComplaintModalOpen(false);
          setTargetItem(null);
          fetchComplaints();
        }}
      />

      <Dialog open={descriptionModalOpen} onClose={handleCloseDescription} maxWidth="sm" fullWidth>
        <DialogTitle>
          Complaint Description
          <IconButton onClick={handleCopyDescription} size="small" sx={{ ml: 1 }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", paddingBottom: 2 }}>
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

export default ComplaintList;