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
          Statuses List
        </Typography>
        { hasPermission(MODULES.STATUSES, PERMISSIONS.CREATE) &&
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            + Add Status
          </Button>
}
      </Box>

      {/* Table */}
      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={{ xs: 2, sm: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Sr#</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Name</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statuses.length > 0 ? (
                  statuses.map((status, idx) => (
                  <TableRow key={status.id}>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{status.name}</TableCell>
                    
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
