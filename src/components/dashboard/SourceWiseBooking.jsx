import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";

const SourceWiseBookings = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAdminDashboard();
        const payload = res?.data?.data ?? res?.data ?? {};

        const rows =
          payload?.source_wise_bookings?.map((item) => ({
            id: item.source_id ?? item.source?.id,
            name: item.source?.name ?? "Unknown Source",
            bookings: item.bookings ?? 0,
          })) ?? [];

        setData(rows);
      } catch (err) {
        console.error("Error fetching source wise bookings:", err);
        setError(err?.message ?? "Failed to fetch data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}>
            Source Wise Bookings
          </Typography>
          <Alert severity="error">Error: {error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}>
          Source Wise Bookings 
        </Typography>

        <TableContainer component={MuiPaper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Sr#</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Source</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Bookings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <TableRow key={row.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.primary" }}>
                      {row.name}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#23C7B7" }}>
                      {row.bookings}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: "text.secondary" }}>
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SourceWiseBookings;
