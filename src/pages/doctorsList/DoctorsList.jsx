// src/pages/DoctorsPage.jsx
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
  Stack,
  TextField,
  Autocomplete,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { useCallback } from "react";
import { getDoctors, deleteDoctor } from "../../DAL/doctors";
import CreateDoctorModal from "../../components/forms/DoctorForm";
import { useSnackbar } from "notistack";
import ActionButtons from "../../constants/actionButtons";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";
import { getDepartmentsList } from "../../DAL/departments";
import { getProceduresList } from "../../DAL/procedure";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission } = useAuth();

  const [filters, setFilters] = useState({
    department_id: "",
    procedure_id: "",
  });

  // Lists for filters
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);

  const fetchFilterLists = async () => {
    setListsLoading(true);
    try {
      const [deptRes, procRes] = await Promise.all([
        getDepartmentsList(),
        getProceduresList(),
      ]);
      setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : []);
      setProcedures(Array.isArray(procRes?.data) ? procRes.data : []);
    } catch (err) {
      console.error("Error fetching filter lists:", err);
      setDepartments([]);
      setProcedures([]);
    } finally {
      setListsLoading(false);
    }
  };

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDoctors(
        page + 1,
        rowsPerPage,
        filters.department_id,
        filters.procedure_id
      );
      setDoctors(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchFilterLists();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await deleteDoctor(id);

      if (res?.status === "error" || (res?.code && res.code !== 200)) {
        enqueueSnackbar(res.message || "Failed to delete doctor", {
          variant: "error",
        });
        return;
      }

      enqueueSnackbar("Doctor deleted successfully", { variant: "success" });
      fetchDoctors();
    } catch (err) {
      console.error("Failed to delete doctor", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete doctor";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setTargetItem(doc);
    setOpenModal(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value || "" }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      department_id: "",
      procedure_id: "",
    });
    setPage(0);
  };

  const renderProcedures = (proceduresList) => {
    if (!proceduresList || proceduresList.length === 0) return "-";

    const procedureNames = proceduresList.map((p) => p.name);

    if (procedureNames.length <= 5) {
      return procedureNames.join(", ");
    }

    const displayedProcedures = procedureNames.slice(0, 5).join(", ");
    const remainingProcedures = procedureNames.slice(5).join(", ");
    const remainingCount = procedureNames.length - 5;

    return (
      <Tooltip title={remainingProcedures} arrow placement="top">
        <span style={{ cursor: "help" }}>
          {displayedProcedures}
          <span style={{ color: "#1976d2", fontWeight: "bold" }}>
            {" "}
            +{remainingCount} more
          </span>
        </span>
      </Tooltip>
    );
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
          Doctors
        </Typography>
        {hasPermission(MODULES.DOCTORS, PERMISSIONS.CREATE) && (
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            + Add Doctor
          </Button>
        )}
      </Box>

      {/* Inline Filters */}
      <Paper sx={{ mb: 2, p: { xs: 1.5, sm: 2 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            select
            label="Department"
            value={filters.department_id}
            onChange={(e) =>
              handleFilterChange("department_id", e.target.value)
            }
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            options={procedures}
            getOptionLabel={(option) => option.name || ""}
            value={
              procedures.find((p) => p.id === filters.procedure_id) || null
            }
            onChange={(e, value) =>
              handleFilterChange("procedure_id", value?.id)
            }
            renderInput={(params) => (
              <TextField {...params} label="Procedure" size="small" />
            )}
            isOptionEqualToValue={(o, v) => o?.id === v?.id}
            disablePortal
            sx={{ flex: 1, minWidth: 200 }}
          />

          <Button
            variant="outlined"
            color="error"
            onClick={clearFilters}
            size="small"
            sx={{
              whiteSpace: "nowrap",
              flexShrink: 0,
              minWidth: 100,
            }}
          >
            Clear
          </Button>
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ overflowX: "auto" }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={{ xs: 2, sm: 3 }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table sx={{ minWidth: { xs: 650, sm: "auto" } }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Sr#
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Phone
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Department
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Procedures
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Availability
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.length > 0 ? (
                  doctors.map((doctor, idx) => (
                    <TableRow key={doctor.id}>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {doctor.name}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {doctor.phone_number}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {doctor.department?.name}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        {renderProcedures(doctor.procedures)}
                      </TableCell>
                      <TableCell>
                        {doctor.availability &&
                          Object.entries(doctor.availability).map(
                            ([day, a]) => (
                              <Box key={day}>
                                <strong>
                                  {day.charAt(0).toUpperCase() + day.slice(1)}
                                </strong>
                                :{" "}
                                <span
                                  style={{
                                    color: a.available ? "green" : "red",
                                  }}
                                >
                                  {a.available
                                    ? `${dayjs(a.start_time, "HH:mm").format(
                                        "hh:mm A"
                                      )} - ${dayjs(a.end_time, "HH:mm").format(
                                        "hh:mm A"
                                      )}`
                                    : "Unavailable"}
                                </span>
                              </Box>
                            )
                          )}
                      </TableCell>
                      <TableCell>
                        <ActionButtons
                          onEdit={
                            hasPermission(MODULES.DOCTORS, PERMISSIONS.EDIT)
                              ? () => handleEdit(doctor)
                              : null
                          }
                          onDelete={
                            hasPermission(MODULES.DOCTORS, PERMISSIONS.DELETE)
                              ? () => handleDelete(doctor.id)
                              : null
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No doctors found
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
      <CreateDoctorModal
        isEditing={!!targetItem}
        data={targetItem}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchDoctors();
          setTargetItem(null);
        }}
      />
    </Box>
  );
};

export default DoctorsPage;
