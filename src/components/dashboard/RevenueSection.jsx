import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";

const RevenueSection = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculatePercentage = (arrived, bookings) =>
    bookings ? `${Math.round((Number(arrived) / Number(bookings)) * 100)}%` : "NIL";

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(Number(amount || 0));

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminDashboard();
        // ✅ Access nested structure correctly
        const rows = response?.data?.revenue?.rows ?? [];
        setRevenueData(rows);
      } catch (err) {
        setError(err.message || "Failed to load revenue data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  return (
    <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Revenue
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={32} sx={{ color: "primary.main" }} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && (
          <TableContainer component={Paper} sx={{ boxShadow: "none", border: 1, borderColor: "divider" }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f9fafb" }}>
                <TableRow>
                  {["Sr#", "Agent", "Bookings", "Arrived", "No Show", "Arrived %", "Revenue", "Incentive"].map(
                    (header) => (
                      <TableCell key={header} sx={{ fontWeight: "bold" }}>
                        {header}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {revenueData.length > 0 ? (
                  revenueData.map((row, index) => (
                    <TableRow key={row.agent_id ?? index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.agent?.name ?? "Unknown Agent"}</TableCell>
                      <TableCell>{row.bookings ?? 0}</TableCell>
                      <TableCell>{row.arrived ?? 0}</TableCell>
                      <TableCell>{row.no_show ?? 0}</TableCell>
                      <TableCell sx={{ color: "primary.main", fontWeight: "bold" }}>
                        {calculatePercentage(row.arrived, row.bookings)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{formatCurrency(row.revenue)}</TableCell>
                      <TableCell sx={{ color: "warning.main", fontWeight: "bold" }}>
                        {formatCurrency(row.incentive)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No revenue data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueSection;
