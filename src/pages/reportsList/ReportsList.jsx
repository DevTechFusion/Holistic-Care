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

import { getAllReports } from "../../DAL/reports";
import { useSnackbar } from "notistack";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getAllReports();

        // Adjust based on your response structure
        const reportList = res?.data?.data || [];
        setReports(reportList);

        // set total from response metadata
        setTotal(res?.data?.total || 0);

        console.log("Fetched reports:", reportList);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (error) {
    return <Typography color="error">Error fetching reports</Typography>;
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Reports</Typography>
      </Box>

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
                  <TableCell>Date</TableCell>
                  <TableCell>Time Slot</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Procedure</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Remarks_1</TableCell>
                  <TableCell>Remarks_2</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>MOP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((rep, idx) => (
                  <TableRow key={rep.id}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>{rep.appointment?.date}</TableCell>
                    <TableCell>{rep.appointment?.time_slot}</TableCell>
                    <TableCell>{rep.appointment?.patient_name}</TableCell>
                    <TableCell>{rep.appointment?.contact_number}</TableCell>
                    <TableCell>{rep.appointment?.doctor?.name}</TableCell>
                    <TableCell>{rep.appointment?.procedure?.name}</TableCell>
                    <TableCell>{rep.appointment?.department?.name}</TableCell>
                    <TableCell>{rep.appointment?.agent?.name}</TableCell>
                    <TableCell>{rep.appointment?.source?.name}</TableCell>
                    <TableCell>{rep.appointment?.remarks_1_id}</TableCell>
                    <TableCell>{rep.appointment?.remarks_2_id}</TableCell>
                    <TableCell>{rep.appointment?.status_id }</TableCell>
                    <TableCell>{rep.amount}</TableCell>
                    <TableCell>{rep.appointment?.payment_mode}</TableCell>
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
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[15, 25, 50, 100]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ReportsPage;
