// src/pages/users/UsersPage.jsx
import { useCallback, useEffect, useState } from "react";
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
import { getUsers, deleteUser } from "../../DAL/users";
import CreateUserModal from "../../components/forms/UserForm";
import ActionButtons from "../../constants/actionButtons";
import { useLocation } from "react-router-dom";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const { pathname } = useLocation();

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers(
        page + 1,
        rowsPerPage,
        pathname === "/agents" ? "agent" : "managerly"
      );
      setUsers(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, pathname]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const handleEditUser = (user) => {
    setTargetItem(user);
    setOpenModal(true);
  };

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Users</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Agent
        </Button>
      </Box>

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
                  <TableCell>Email</TableCell>
                  <TableCell>Agent ID</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow key={user.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <ActionButtons
                        onEdit={() => handleEditUser(user)}
                        onDelete={() => handleDeleteUser(user.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
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

      {/* Create User Modal */}
      <CreateUserModal
        isEditing={!!targetItem}
        data={targetItem}
        open={openModal}
        defaultRole={pathname === "/managers" ? "managerly" : "agent"} // ✅ auto-select
        onClose={() => {
          setOpenModal(false);
          fetchUsers();
          setTargetItem(null);
        }}
      />
    </Box>
  );
};

export default UsersPage;
