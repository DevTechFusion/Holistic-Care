import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";

import { getUsers, deleteUser } from "../../DAL/users";
import UsersFilterPopover from "./UsersFilterPopover";
import UserForm from "../../components/forms/UserForm";
import ActionButtons from "../../constants/actionButtons"; 
import { useSnackbar } from "notistack";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const UsersList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [filters, setFilters] = useState({
    role: "all",
  });

  const [filterAnchor, setFilterAnchor] = useState(null);
  const { hasPermission } = useAuth();
  const openFilter = Boolean(filterAnchor);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsers(page + 1, rowsPerPage, filters.role || "all");
      const data = res?.data?.data ?? res?.data ?? [];
      const totalCount = res?.data?.total ?? (Array.isArray(data) ? data.length : 0);
      setUsers(data);
      setTotal(Number(totalCount) || 0);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(0);
  }, [filters]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      // refresh list after delete
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  // Open modal for creating a new user
  const handleOpenCreateUser = () => {
    setTargetItem(null);
    setOpenModal(true);
  };

  // Open modal for editing an existing user
  const handleOpenEditUser = (user) => {
    setTargetItem(user);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTargetItem(null);
    fetchUsers();
  };

  return (
    <Box p={3}>
      <Stack 
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}>
        <Typography variant="h5" fontWeight={600}>
            Users
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            variant="outlined"
          >
            Filter
          </Button>
          {hasPermission(MODULES.USERS, PERMISSIONS.CREATE) && 
          <Button variant="contained" onClick={handleOpenCreateUser}>
            + Add User
          </Button> }
        </Stack>
      </Stack>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
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
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No users found</TableCell>
                  </TableRow>
                ) : (
                  users.map((u, idx) => (
                    <TableRow key={u.id || idx}>
                      <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>{u.name || "-"}</TableCell>
                      <TableCell>{u.email || "-"}</TableCell>
                      <TableCell>{(u.roles || []).map(r => r.name).join(", ") || "-"}</TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={() => handleOpenEditUser(u)}
                          onDelete={() => handleDeleteUser(u.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
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
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 15, 25]}
            />
          </>
        )}
      </Paper>

      <UsersFilterPopover
        anchorEl={filterAnchor}
        open={openFilter}
        onClose={() => setFilterAnchor(null)}
        filters={filters}
        setFilters={(f) => {
          setFilters(f);
          setFilterAnchor(null);
        }}
      />

      {/* User create / edit modal */}
      <UserForm
        open={openModal}
        onClose={() => handleCloseModal(false)}
        isEditing={!!targetItem}
        data={targetItem}
        onSuccess={() => handleCloseModal(true)}
      />
    </Box>
  );
};

export default UsersList;