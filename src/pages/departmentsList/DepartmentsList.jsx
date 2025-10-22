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
import { getAllDepartments, deleteDepartment } from "../../DAL/departments";
import CreateDepartmentModal from "../../components/forms/DepartmentForm";
import ActionButtons from "../../constants/actionButtons";
import { useSnackbar } from "notistack";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission } = useAuth();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getAllDepartments(page + 1, rowsPerPage);
      setDepartments(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, rowsPerPage]);

  const handleDelete = async (id) => {
  try {
    const res = await deleteDepartment(id);
    
    if (res?.status === "error" || (res?.code && res.code !== 200)) {
      enqueueSnackbar(res.message || "Failed to delete department", { 
        variant: "error" 
      });
      return;
    }
    
    enqueueSnackbar("Department deleted successfully", { variant: "success" });
    fetchDepartments();
  } catch (error) {
    console.error("Delete failed", error);
    const message = 
      error?.response?.data?.message || 
      error?.message || 
      "Failed to delete department";
    enqueueSnackbar(message, { variant: "error" });
  } finally {
    setLoading(false); 
  }
};

  const handleEdit = (dept) => {
    setTargetItem(dept);
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
        <Typography variant="h5">Departments List</Typography>
        {( hasPermission( MODULES.DEPARTMENTS, PERMISSIONS.CREATE ) &&
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Department
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
                  <TableCell>Department Name</TableCell>
                  <TableCell>Incentive %</TableCell>
                  {<TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.length > 0 ? (
                  departments.map((dept, idx) => (
                    <TableRow key={dept.id}>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>{dept.name}</TableCell>
                      <TableCell>{dept.incentive_percentage}%</TableCell>
                        <TableCell>
                          <ActionButtons
                            onEdit={ hasPermission( MODULES.DEPARTMENTS, PERMISSIONS.EDIT ) ? () => handleEdit(dept) : null}
                            onDelete={ hasPermission( MODULES.DEPARTMENTS, PERMISSIONS.DELETE ) ? () => handleDelete(dept.id) : null}
                          />
                        </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No Departments Found
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
                setRowsPerPage(parseInt(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Modal */}
      <CreateDepartmentModal
        isEditing={!!targetItem}
        data={targetItem}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchDepartments();
          setTargetItem(null);
        }}
      />
    </Box>
  );
};

export default DepartmentsPage;