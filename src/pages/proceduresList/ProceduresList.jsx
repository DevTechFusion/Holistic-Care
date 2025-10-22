// src/pages/ProceduresPage.jsx
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
import { useSnackbar } from "notistack";
import { getProcedures, deleteProcedure } from "../../DAL/procedure";
import CreateProcedureModal from "../../components/forms/ProcedureForm";
import ActionButtons from "../../constants/actionButtons";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const ProceduresPage = () => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [targetItem, setTargetItem] = useState(null);

  const { hasPermission } = useAuth();

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const res = await getProcedures(page + 1, rowsPerPage);
      const procedures = res?.data?.data || [];
      setTotal(res?.data?.total || 0);
      setProcedures(procedures);
    } catch (err) {
      console.error("Failed to fetch procedures", err);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, [page, rowsPerPage]);

  const handleDeleteProcedure = async (id) => {
    try {
      const res = await deleteProcedure(id);

      if (res?.status === "error" || (res?.code && res.code !== 200)) {
        enqueueSnackbar(res.message || "Failed to delete procedure", {
          variant: "error",
        });
        return;
      }

      enqueueSnackbar("Procedure deleted successfully", { variant: "success" });
      fetchProcedures();
    } catch (err) {
      console.error("Failed to delete procedure", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete procedure";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false); // If you have a loading state
    }
  };
  const handleUpdateProcedure = (proc) => {
    setTargetItem(proc);
    setOpenModal(true);
  };

  return (
    <Box p={{ xs: 2, sm: 3 }}>
      {/* Page Header */}
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
          Procedures
        </Typography>
        {hasPermission(MODULES.PROCEDURES, PERMISSIONS.CREATE) && (
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            + Add Procedure
          </Button>
        )}
      </Box>

      {/* Table */}
      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={{ xs: 2, sm: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Sr#</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Procedure Name</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {procedures.length > 0 ? (
                  procedures.map((proc, idx) => (
                    <TableRow key={proc.id || idx}>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{proc.name}</TableCell>

                      <TableCell>
                        <ActionButtons
                          onEdit={
                            hasPermission(MODULES.PROCEDURES, PERMISSIONS.EDIT)
                              ? () => handleUpdateProcedure(proc)
                              : null
                          }
                          onDelete={
                            hasPermission(
                              MODULES.PROCEDURES,
                              PERMISSIONS.DELETE
                            )
                              ? () => handleDeleteProcedure(proc.id)
                              : null
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No procedures found
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
                setRowsPerPage(parseInt(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Create Procedure Modal */}
      <CreateProcedureModal
        isEditing={Boolean(targetItem)}
        data={targetItem}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchProcedures();
          setTargetItem(null);
        }}
      />
    </Box>
  );
};

export default ProceduresPage;
