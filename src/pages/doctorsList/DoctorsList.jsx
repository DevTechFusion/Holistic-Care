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
import { getDoctors, deleteDoctor } from "../../DAL/doctors";
import CreateDoctorModal from "../../components/forms/DoctorForm";
import { useSnackbar } from "notistack";
import ActionButtons from "../../constants/actionButtons";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const enqueueSnackbar = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [targetItem, setTargetItem] = useState(null);

  const fetchDoctors = async () => {
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
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, rowsPerPage]);

  const handleDelete = async (id) => {
    try {
      await deleteDoctor(id);
      fetchDoctors();
      enqueueSnackbar("Doctor deleted successfully", { variant: "success" });
    } catch (err) {
      console.error("Failed to delete doctor", err);
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
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Doctor
        </Button>
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
            <TableCell>Phone</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Procedures</TableCell>
            <TableCell>Availability</TableCell>
            <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor, idx) => (
            <TableRow key={doctor.id}>
              <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
              <TableCell>{doctor.name}</TableCell>
              <TableCell>{doctor.phone_number}</TableCell>
              <TableCell>{doctor.department?.name}</TableCell>
              <TableCell>
                {doctor.procedures?.map((p) => p.name).join(", ")}
              </TableCell>
              <TableCell>
                {doctor.availability?.map((a) => (
              <Box key={a.day}>
                <strong>{a.day}</strong>:{" "}
                <span style={{ color: a.available ? "green" : "red" }}>
                  {a.available ? "Available" : "Unavailable"}
                </span>
              </Box>
                ))}
              </TableCell>
              <TableCell>
                <ActionButtons
              onEdit={() => handleEdit(doctor)}
              onDelete={() => handleDelete(doctor.id)}
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
                setRowsPerPage(parseInt(e.target.value));
                setPage(0);
              }}
              rowsPerPageOptions={[15, 25, 50, 100]}
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
