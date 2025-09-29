import { useEffect, useState } from "react";
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
} from "@mui/material";
import { getAllStatuses, deleteStatus } from "../../DAL/status";
import CreateStatusModal from "../../components/forms/StatusForm";
import ActionButtons from "../../constants/actionButtons";
import { useAuth } from "../../contexts/AuthContext";

const StatusesPage = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0); // TablePagination is 0-based
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);

  const { user } = useAuth();
  const role = user?.roles?.[0]?.name ?? null;
  const isSuperAdmin = role === "super_admin";

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await getAllStatuses(page + 1, rowsPerPage); // API expects 1-based page
      setStatuses(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch statuses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [page, rowsPerPage]);

  const handleDelete = async (id) => {
    try {
      await deleteStatus(id);
      fetchStatuses();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEdit = (status) => {
    setTargetItem(status);
    setOpenModal(true);
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
        <Typography variant="h5">Statuses List</Typography>
        {isSuperAdmin && (
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Status
          </Button>
        )}
      </Box>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr#</TableCell>
                  <TableCell>Name</TableCell>
                  {isSuperAdmin && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {statuses.map((status, idx) => (
                  <TableRow key={status.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{status.name}</TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <ActionButtons
                          onEdit={() => handleEdit(status)}
                          onDelete={() => handleDelete(status.id)}
                        />
                      </TableCell>
                    )}
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
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Modal */}
      <CreateStatusModal
        isEditing={!!targetItem}
        data={targetItem}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchStatuses();
          setTargetItem(null);
        }}
      />
    </Box>
  );
};

export default StatusesPage;
