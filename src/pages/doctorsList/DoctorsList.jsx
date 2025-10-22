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
} from "@mui/material";
import { useCallback } from "react";
import { getDoctors, deleteDoctor } from "../../DAL/doctors";
import CreateDoctorModal from "../../components/forms/DoctorForm";
import { useSnackbar } from "notistack";
import ActionButtons from "../../constants/actionButtons";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/AuthContext";
import { MODULES, PERMISSIONS } from "../../constants/permissionConstants";

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

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDoctors(page + 1, rowsPerPage);
      setDoctors(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDelete = async (id) => {
  setLoading(true);
  try {
    const res = await deleteDoctor(id);
    
    if (res?.status === "error" || (res?.code && res.code !== 200)) {
      enqueueSnackbar(res.message || "Failed to delete doctor", { 
        variant: "error" 
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

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Doctors</Typography>
        {( hasPermission(MODULES.DOCTORS, PERMISSIONS.CREATE) &&
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            + Add Doctor
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
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Procedures</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doctors.length > 0 ? (
                  doctors.map((doctor, idx) => (
                  <TableRow key={doctor.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{doctor.name}</TableCell>
                    <TableCell>{doctor.phone_number}</TableCell>
                    <TableCell>{doctor.department?.name}</TableCell>
                    <TableCell>
                      {doctor.procedures?.map((p) => p.name).join(", ")}
                    </TableCell>
                    <TableCell>
                      {doctor.availability &&
                        Object.entries(doctor.availability).map(([day, a]) => (
                          <Box key={day}>
                            <strong>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </strong>
                            :{" "}
                            <span
                              style={{ color: a.available ? "green" : "red" }}
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
                        ))}
                    </TableCell>

                  
                      <TableCell>
                        <ActionButtons
                          onEdit={ hasPermission(MODULES.DOCTORS, PERMISSIONS.EDIT) ? () => handleEdit(doctor) : null}
                          onDelete={ hasPermission(MODULES.DOCTORS, PERMISSIONS.DELETE) ? () => handleDelete(doctor.id) : null}
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
