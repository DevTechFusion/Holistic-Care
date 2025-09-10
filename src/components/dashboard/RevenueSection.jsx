// src/components/dashboard/RevenueSection.jsx
import { useState, useEffect, useMemo } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";
import CanvasJSReact from "@canvasjs/react-charts";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const RevenueSection = ({ filter }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("revenue");

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

  // Chart Options
  const chartOptions = useMemo(() => {
    const dataPoints =
      tab === "revenue"
        ? revenueData.map((row) => ({
            name: row.agent?.name || "Unknown",
            y: Number(row.revenue) || 0,
          }))
        : revenueData.map((row) => ({
            name: row.agent?.name || "Unknown",
            y: Number(row.bookings) || 0,
          }));

    const total =
      tab === "revenue"
        ? revenueData.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0)
        : revenueData.reduce((sum, r) => sum + (Number(r.bookings) || 0), 0);

    return {
      animationEnabled: true,
      backgroundColor: "transparent", // ✅ remove chart background
      subtitles: [
        {
          text:
            tab === "revenue"
              ? `Total: ${formatCurrency(total)}`
              : `Total: ${total} bookings`,
          verticalAlign: "center",
          fontSize: 16,
          dockInsidePlotArea: true,
        },
      ],
      data: [
        {
          type: "doughnut",
          showInLegend: true,
          legendText: "{name}",
          indexLabel: "{name}: {y}",
          yValueFormatString:
            tab === "revenue" ? "₨#,###" : "#,### bookings",
          dataPoints,
        },
      ],
    };
  }, [revenueData, tab]);

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}
        >
          Revenue
        </Typography>

        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          {/* Revenue Table */}
          <Box sx={{ flex: 2 }}>
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
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Sr#</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Agent</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Bookings</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Arrived</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>No Show</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Arrived %age
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Revenue</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Incentive
                      </TableCell>
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
                          <TableCell
                            sx={{ color: "#23C7B7", fontWeight: "bold" }}
                          >
                            {calculatePercentage(row.arrived, row.bookings)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            {formatCurrency(row.revenue)}
                          </TableCell>
                          <TableCell
                            sx={{ color: "#FF9800", fontWeight: "bold" }}
                          >
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

          {/* Chart Section */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2,
              minHeight: 420,
            }}
          >
            {/* Pills Tabs */}
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{
                mb: 2,
                backgroundColor: "#f1f5f9",
                borderRadius: "9999px",
                minHeight: "36px",
                "& .MuiTab-root": {
                  minHeight: "36px",
                  textTransform: "none",
                  fontWeight: "600",
                  borderRadius: "9999px",
                  mx: 0.5,
                },
                "& .Mui-selected": {
                  backgroundColor: "#23C7B7",
                  color: "#fff !important",
                },
              }}
            >
              <Tab label="Revenue" value="revenue" />
              <Tab label="Bookings" value="bookings" />
            </Tabs>

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}
            >
              {tab === "revenue" ? "Revenue by Agent" : "Bookings by Agent"}
            </Typography>

            {loading ? (
              <CircularProgress size={32} sx={{ color: "#23C7B7", mt: 5 }} />
            ) : (
              <Box sx={{ width: "100%", height: "100%" }}>
                <CanvasJSChart options={chartOptions} />
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueSection;
