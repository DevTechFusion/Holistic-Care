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
  try {
    const res = await deleteUser(id);

    if (res?.status === "error" || (res?.code && res.code !== 200)) {
      enqueueSnackbar(res.message || "Failed to delete user", {
        variant: "error",
      });
      return;
    }

    enqueueSnackbar("User deleted successfully", { variant: "success" });
    fetchUsers(); 
  } catch (error) {
    console.error("Failed to delete user:", error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete user";

    enqueueSnackbar(message, { variant: "error" });
  } finally {
    setLoading(false); 
  }
};

  const handleOpenCreateUser = () => {
    setTargetItem(null);
    setOpenModal(true);
  };

 
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
    <Box p={{ xs: 2, sm: 3 }}>
      <Stack 
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={{ xs: 1.5, sm: 0 }}
        mb={{ xs: 2, sm: 2 }}
      >
        <Typography 
          variant="h5" 
          fontWeight={600}
          sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
        >
            Users List
        </Typography>

        <Stack 
          direction={{ xs: "column", sm: "row" }} 
          spacing={2} 
          alignItems="center"
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <Button
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            variant="outlined"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Filter
          </Button>
          {hasPermission(MODULES.USERS, PERMISSIONS.CREATE) && 
          <Button 
            variant="contained" 
            onClick={handleOpenCreateUser}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            + Add User
          </Button> }
        </Stack>
      </Stack>

      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Sr#</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Name</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Email</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Role</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.length > 0 ? (
                  users.map((u, idx) => (
                    <TableRow key={u.id || idx}>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{u.name || "-"}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{u.email || "-"}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{(u.roles || []).map(r => r.name).join(", ") || "-"}</TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={ hasPermission(MODULES.USERS, PERMISSIONS.EDIT) ? () => handleOpenEditUser(u) : null}
                          onDelete={ hasPermission(MODULES.USERS, PERMISSIONS.DELETE) ? () => handleDeleteUser(u.id) : null}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) 
                : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No users found
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