// src/pages/RolesList.jsx
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
import { getRoles, deleteRole } from "../../DAL/roles";
import CreateRoleModal from "../../components/forms/RolesForm";
import ActionButtons from "../../constants/actionButtons";
import PermissionModal from "./PermissionModal";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [targetItem, setTargetItem] = useState(null);

  const { hasPermission } = useAuth();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await getRoles(page + 1, rowsPerPage);
      const roles = res?.data?.data || [];
      setTotal(res?.data?.total || 0);
      setRoles(roles);
    } catch (err) {
      console.error("Failed to fetch roles", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage]);

  const handleDeleteRole = async (id) => {
    try {
      const res = await deleteRole(id);

      if (res?.status === "error" || (res?.code && res.code !== 200)) {
        enqueueSnackbar(res.message || "Failed to delete role", {
          variant: "error",
        });
        return;
      }

      enqueueSnackbar("Role deleted successfully", { variant: "success" });
      fetchRoles();
    } catch (error) {
      console.error("Failed to delete role:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete role";

      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = (role) => {
    setTargetItem(role);
    setOpenModal(true);
  };

  const handleAddPermission = (role) => {
    setTargetItem(role);
    setPermissionModalOpen(true);
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
          Roles
        </Typography>
        {hasPermission(MODULES.ROLES, PERMISSIONS.CREATE) && (
          <Button 
            variant="contained" 
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            + Add Role
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
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Role Name</TableCell>
                  <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.length > 0 ? (
                  roles.map((role, idx) => (
                    <TableRow key={role.id || idx}>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{role.name}</TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={
                            hasPermission(MODULES.ROLES, PERMISSIONS.EDIT)
                              ? () => handleUpdateRole(role)
                              : null
                          }
                          onDelete={
                            hasPermission(MODULES.ROLES, PERMISSIONS.DELETE)
                              ? () => handleDeleteRole(role.id)
                              : null
                          }
                          onAdd={
                            hasPermission(
                              MODULES.ROLES,
                              PERMISSIONS.ASSIGN
                            )
                              ? () => handleAddPermission(role)
                              : null
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No roles found
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
              rowsPerPageOptions={[5, 15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Create Role Modal */}
      <CreateRoleModal
        isEditing={Boolean(targetItem)}
        data={targetItem}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchRoles();
          setTargetItem(null);
        }}
      />
      <PermissionModal
        open={permissionModalOpen}
        role={targetItem}
        onClose={() => {
          setPermissionModalOpen(false);
          setTargetItem(null);
          fetchRoles(); // Optionally refresh roles
        }}
      />
    </Box>
  );
};

export default RolesList;
