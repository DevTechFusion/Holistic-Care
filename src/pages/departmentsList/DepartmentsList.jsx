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
import { useAuth } from "../../contexts/AuthContext";
const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);

  const { user } = useAuth();
    const role = user?.roles?.[0]?.name ?? null;
    const isSuperAdmin = role === "super_admin";

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
      await deleteDepartment(id);
      fetchDepartments();
    } catch (err) {
      console.error("Delete failed", err);
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
        <Typography variant="h5">Departments</Typography>
        {isSuperAdmin && (
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
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  {isSuperAdmin && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dept, idx) => (
                  <TableRow key={dept.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{dept.name}</TableCell>
                    {isSuperAdmin && (<TableCell>
                      <ActionButtons
                        onEdit={() => handleEdit(dept)}
                        onDelete={() => handleDelete(dept.id)}
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
                setRowsPerPage(parseInt(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[15, 25, 50, 100]}
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
