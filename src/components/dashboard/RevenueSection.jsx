// components/dashboard/RevenueSection.jsx
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

const calculatePercentage = (arrived, bookings) => {
  if (!bookings) return "NIL";
  return `${Math.round((Number(arrived) / Number(bookings)) * 100)}%`;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR" }).format(
    Number(amount || 0)
  );

const RevenueSection = ({ revenueData, loading, error }) => {
  return (
    <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
          Revenue
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={32} sx={{ color: "#23C7B7" }} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={MuiPaper} sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Sr#</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Bookings</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Arrived</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>No Show</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Arrived %</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Incentive</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revenueData.length > 0 ? (
                  revenueData.map((row, index) => (
                    <TableRow key={row.agent_id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.agent?.name || "Unknown Agent"}</TableCell>
                      <TableCell>{row.bookings || 0}</TableCell>
                      <TableCell>{row.arrived || 0}</TableCell>
                      <TableCell>{row.no_show || 0}</TableCell>
                      <TableCell sx={{ color: "#23C7B7", fontWeight: "bold" }}>
                        {calculatePercentage(row.arrived, row.bookings)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>{formatCurrency(row.revenue)}</TableCell>
                      <TableCell sx={{ color: "#FF9800", fontWeight: "bold" }}>
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
