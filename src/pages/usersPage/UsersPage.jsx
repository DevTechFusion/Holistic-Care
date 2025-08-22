// src/pages/users/UsersPage.jsx
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
} from "@mui/material";
import { getUsers } from "../../DAL/users"; 
import CreateUserModal from "../../components/forms/UserForm"; // you'll create this like DepartmentForm

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Users</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add User
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, idx) => (
                <TableRow key={user.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.roles.map((role) => role.name).join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create User Modal */}
      <CreateUserModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchUsers(); // refresh after creating user
        }}
      />
    </Box>
  );
};

export default UsersPage;
