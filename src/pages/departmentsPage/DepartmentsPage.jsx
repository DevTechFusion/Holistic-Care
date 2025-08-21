// src/pages/DepartmentsPage.jsx
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
import { getDepartments } from "../../DAL/departments"; 
import CreateDepartmentModal from "../../components/forms/DepartmentForm";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      console.log("API Response:", res);

      const departments = res?.data?.data || [];
      setDepartments(departments);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Departments</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Department
        </Button>
      </Box>

      <Paper>
        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sr#</TableCell>
                <TableCell>Department Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length > 0 ? (
                departments.map((department, index) => (
                  <TableRow key={department.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{department.name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No departments found</TableCell>
                </TableRow>
                
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create Department Modal */}
      <CreateDepartmentModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchDepartments(); // refresh after creation
        }}
      />
    </Box>
  );
};

export default DepartmentsPage;
