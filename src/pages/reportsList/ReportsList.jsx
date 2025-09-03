import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableContainer,
} from "@mui/material";

import { getAllReports } from "../../DAL/reports";
import { useSnackbar } from "notistack";

const statusColors = {
  "Already Taken": "#e7f2fe", // light blue
  "Arrived": "#b3e5ca", // dark green
  "Cancelled": "#f99f9f", // dark red
  "Not Show": "#FFE4F7", // light pink
  "Rescheduled": "#FFFEE0", // yellow
};

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

        const reportList = res?.data?.data || [];
        setReports(reportList);

        setTotal(res?.data?.total || 0);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Reports</Typography>
      </Box>

      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 700 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        backgroundColor: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      Sr#
                    </TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Duration</TableCell>
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
                  {reports.map((rep, idx) => {
                    const status = rep.status?.name;
                    const bgColor = statusColors[status] || "inherit";

                    return (
                      <TableRow
                        key={rep.id}
                        sx={{
                          backgroundColor: bgColor,
                          "&:hover": {
                            backgroundColor: bgColor,
                            opacity: 0.9,
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                            backgroundColor: bgColor,
                            fontWeight: 500,
                          }}
                        >
                          {page * rowsPerPage + idx + 1}
                        </TableCell>
                        <TableCell>{rep.appointment?.date}</TableCell>
                        <TableCell>{rep.appointment?.duration}</TableCell>
                        <TableCell>{rep.appointment?.patient_name}</TableCell>
                        <TableCell>{rep.appointment?.contact_number}</TableCell>
                        <TableCell>{rep.appointment?.doctor?.name}</TableCell>
                        <TableCell>{rep.appointment?.procedure?.name}</TableCell>
                        <TableCell>{rep.appointment?.department?.name}</TableCell>
                        <TableCell>{rep.appointment?.agent?.name}</TableCell>
                        <TableCell>{rep.appointment?.source?.name}</TableCell>
                        <TableCell>{rep.remarks1?.name}</TableCell>
                        <TableCell>{rep.remarks2?.name}</TableCell>
                        <TableCell>{status}</TableCell>
                        <TableCell>{rep.amount}</TableCell>
                        <TableCell>{rep.appointment?.payment_mode}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

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
