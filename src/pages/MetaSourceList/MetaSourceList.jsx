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
import { getSources, deleteSource } from "../../DAL/source";
import CreateSourceModal from "../../components/forms/MetaSourceForm";
import ActionButtons from "../../constants/actionButtons";
import { useSnackbar } from "notistack";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const SourcesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0); 
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);

  const { hasPermission } = useAuth();


  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await getSources(page + 1, rowsPerPage); 
      setSources(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch sources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [page, rowsPerPage]);

const handleDelete = async (id) => {
  try {
    const res = await deleteSource(id);

    if (res?.status === "error" || (res?.code && res.code !== 200)) {
      enqueueSnackbar(res.message || "Failed to delete source", {
        variant: "error",
      });
      return;
    }

    enqueueSnackbar("Source deleted successfully", { variant: "success" });
    fetchSources(); 
  } catch (error) {
    console.error("Failed to delete source:", error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete source";

    enqueueSnackbar(message, { variant: "error" });
  } finally {
    setLoading(false); 
  }
};


  const handleEdit = (source) => {
    setTargetItem(source);
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
          Meta Ads Sources List
        </Typography>
       { hasPermission(MODULES.SOURCES, PERMISSIONS.CREATE) &&
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            + Add Source
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
                {sources.length > 0 ? ( 
                  sources.map((src, idx) => (
                  <TableRow key={src.id}>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{src.name}</TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={ hasPermission(MODULES.SOURCES, PERMISSIONS.EDIT) ? () => handleEdit(src) : null }
                          onDelete={ hasPermission(MODULES.SOURCES, PERMISSIONS.DELETE) ? () => handleDelete(src.id) : null}
                        />
                      </TableCell>
                  </TableRow>
                ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No sources found
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
      <CreateSourceModal
        isEditing={!!targetItem}
        data={targetItem}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchSources();
          setTargetItem(null);
        }}
      />
    </Box>
  );
};

export default SourcesPage;
