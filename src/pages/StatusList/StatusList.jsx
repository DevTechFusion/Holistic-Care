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
import { useSnackbar } from "notistack";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";


const StatusesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);

  const { hasPermission } = useAuth();

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await getAllStatuses(page + 1, rowsPerPage); 
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
    const res = await deleteStatus(id);

    if (res?.status === "error" || (res?.code && res.code !== 200)) {
      enqueueSnackbar(res.message || "Failed to delete status", {
        variant: "error",
      });
      return;
    }

    enqueueSnackbar("Status deleted successfully", { variant: "success" });
    fetchStatuses(); 
  } catch (error) {
    console.error("Failed to delete status:", error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete status";

    enqueueSnackbar(message, { variant: "error" });
  } finally {
    setLoading(false); 
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
        { hasPermission(MODULES.STATUSES, PERMISSIONS.CREATE) &&
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Status
          </Button>
}
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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statuses.length > 0 ? (
                  statuses.map((status, idx) => (
                  <TableRow key={status.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{status.name}</TableCell>
                    
                      <TableCell>
                        <ActionButtons
                          onEdit={ hasPermission(MODULES.STATUSES, PERMISSIONS.EDIT) ? () => handleEdit(status) : null}
                          onDelete={ hasPermission(MODULES.STATUSES, PERMISSIONS.DELETE) ? () => handleDelete(status.id) : null}
                        />
                      </TableCell>
                    
                  </TableRow>
                )) 
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No statuses found
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
