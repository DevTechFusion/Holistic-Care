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
} from "@mui/material";
import { useSnackbar } from "notistack";
import ActionButtons from "../../constants/actionButtons";
import { getAllMistakes } from "../../DAL/mistakes";
import ComplaintForm from "../../components/forms/ComplaintForm";
import { set } from "lodash";

const ComplaintList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getAllMistakes(page + 1, rowsPerPage); 
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
    fetchComplaints();
  }, [page, rowsPerPage]);

  const handleUpdateComplaint = (complaint) => {
    setTargetItem(complaint);
    setComplaintModalOpen(true);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          Complaints
        </Typography>
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
                  <TableCell>Doctor</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {complaints.map((complaint, idx) => (
                  <TableRow key={complaint.id || idx}>
                    {/* Sr# calculation */}
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>

                    <TableCell>{complaint.appointment_id || "-"}</TableCell>
                    <TableCell>{complaint.complaint_type?.name || "-"}</TableCell>
                    <TableCell>{complaint.description}</TableCell>
                    <TableCell>{complaint.doctor?.name || "-"}</TableCell>
                    <TableCell>{complaint.agent?.name || "-"}</TableCell>
                    <TableCell>
                      {complaint.is_resolved ? (
                        <Chip label="Resolved" color="success" size="small" />
                      ) : (
                        <Chip label="Pending" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <ActionButtons
                        onEdit={() => handleUpdateComplaint(complaint)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

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
    </Box>
  );
};

export default ComplaintList;
