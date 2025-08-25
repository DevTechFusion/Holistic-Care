// src/pages/ProceduresPage.jsx
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
import { getProcedures } from "../../DAL/procedure";
import CreateProcedureModal from "../../components/forms/ProcedureForm";

const ProceduresPage = () => {
  const [procedures, setProcedures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const res = await getProcedures();
      console.log("API Response:", res);

      // ✅ Extract array from nested structure
      const procedures = res?.data?.data || [];
      setProcedures(procedures);
    } catch (err) {
      console.error("Failed to fetch procedures", err);
      setProcedures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  return (
    <Box p={3}>
      {/* Page Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Procedures</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          + Add Procedure
        </Button>
      </Box>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sr#</TableCell>
                <TableCell>Procedure Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {procedures.length > 0 ? (
                procedures.map((proc, idx) => (
                  <TableRow key={proc.id || idx}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{proc.name}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No procedures found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Create Procedure Modal */}
      <CreateProcedureModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          fetchProcedures();
        }}
      />
    </Box>
  );
};

export default ProceduresPage;
