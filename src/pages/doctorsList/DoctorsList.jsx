// src/pages/doctors/DoctorsPage.jsx
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
import { getDoctors } from "../../DAL/doctors"; 
import CreateDoctorModal from "../../components/forms/DoctorForm";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Fetch Doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await getDoctors();
      setDoctors(res?.data?.data || []); 
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Doctors</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Doctor
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
                <TableCell>Phone</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Procedures</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor, idx) => (
                <TableRow key={doctor.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.phone_number}</TableCell>
                  <TableCell>{doctor.department?.name}</TableCell>
                  <TableCell>
                    {doctor.procedures?.map((p) => p.name).join(", ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create Doctor Modal */}
      <CreateDoctorModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchDoctors(); // refresh after creating doctor
        }}
      />
    </Box>
  );
};

export default DoctorsPage;
