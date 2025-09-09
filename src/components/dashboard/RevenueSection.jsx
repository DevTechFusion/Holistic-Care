// src/components/dashboard/RevenueSection.jsx
import { useState, useEffect } from "react";
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
  Paper as MuiPaper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";

const RevenueSection = ({ filter }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminDashboard(filter);
      const payload = response?.data?.data ?? response?.data ?? {};

      setRevenueData(payload?.revenue?.rows || []);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError(err?.message ?? "Failed to fetch Revenue data.");
      setRevenueData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [filter]);

  const calculatePercentage = (arrived, bookings) => {
    if (!bookings) return "NIL";
    const percent = (Number(arrived) / Number(bookings)) * 100;
    return `${Math.round(percent)}%`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₨0";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  };

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}
        >
          Revenue
        </Typography>

        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Revenue Table */}
          <Box sx={{ flex: 1 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
              >
                <CircularProgress size={32} sx={{ color: "#23C7B7" }} />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer
                component={MuiPaper}
                sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Sr#</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Agent</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Bookings</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Arrived</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>No Show</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Arrived %age</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Revenue</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Incentive</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueData.length > 0 ? (
                      revenueData.map((row, index) => (
                        <TableRow key={row.agent_id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {row.agent?.name || "Unknown Agent"}
                          </TableCell>
                          <TableCell>{row.bookings || 0}</TableCell>
                          <TableCell>{row.arrived || 0}</TableCell>
                          <TableCell>{row.no_show || 0}</TableCell>
                          <TableCell sx={{ color: "#23C7B7", fontWeight: "bold" }}>
                            {calculatePercentage(row.arrived, row.bookings)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {formatCurrency(row.revenue)}
                          </TableCell>
                          <TableCell sx={{ color: "#FF9800", fontWeight: "bold" }}>
                            {formatCurrency(row.incentive)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{ py: 3, color: "text.secondary" }}
                        >
                          No revenue data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Chart Placeholder */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 250,
              backgroundColor: "#f9f9f9",
              borderRadius: 2,
              border: "2px dashed #e0e0e0",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Chart Area
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Donut Chart will be added here
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueSection;
