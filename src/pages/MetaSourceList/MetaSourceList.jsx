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
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Meta Ads Sources List</Typography>
       { hasPermission(MODULES.SOURCES, PERMISSIONS.CREATE) &&
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Source
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
                {sources.map((src, idx) => (
                  <TableRow key={src.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{src.name}</TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={() => handleEdit(src)}
                          onDelete={() => handleDelete(src.id)}
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
