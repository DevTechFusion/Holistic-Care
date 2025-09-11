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

const ProceduresPage = () => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [targetItem, setTargetItem] = useState(null);

  const { user } = useAuth();
  const role = user?.roles?.[0]?.name ?? null;
  const isSuperAdmin = role === "super_admin";

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
      await deleteProcedure(id);
      fetchProcedures();
      enqueueSnackbar("Procedure deleted successfully", { variant: "success" });
    } catch (err) {
      console.error("Failed to delete procedure", err);
    }
  };

  const handleUpdateProcedure = (proc) => {
    setTargetItem(proc);
    setOpenModal(true);
  };

  return (
    <Box p={3}>
      {/* Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Procedures</Typography>
        {isSuperAdmin && (
           <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Procedure
        </Button>
        )}
       
      </Box>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sr#</TableCell>
                  <TableCell>Procedure Name</TableCell>
                  {isSuperAdmin && <TableCell>Actions</TableCell>}
              
                </TableRow>
              </TableHead>
              <TableBody>
                {procedures.length > 0 ? (
                  procedures.map((proc, idx) => (
                    <TableRow key={proc.id || idx}>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>{proc.name}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                        <ActionButtons
                          onEdit={() => handleUpdateProcedure(proc)}
                          onDelete={() => handleDeleteProcedure(proc.id)}
                        />
                      </TableCell>
                      )}
                      
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
