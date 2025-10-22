import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getAdminDashboard } from "../../DAL/dashboard";

import RevenueTable from "./RevenueTable";
import RevenueCharts from "./RevenueCharts";

const RevenueSection = ({ filter}) => {
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

        const response = await getAdminDashboard(filter);
        const rows = response?.data?.revenue?.rows ?? [];
        setRevenueData(rows);
      } catch (err) {
        setError(err.message || "Failed to load revenue data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [filter]);

  const topFiveRevenue = useMemo(
    () => [...revenueData].sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0)).slice(0, 5),
    [revenueData]
  );

  const topFiveBookings = useMemo(
    () => [...revenueData].sort((a, b) => (b.bookings ?? 0) - (a.bookings ?? 0)).slice(0, 5),
    [revenueData]
  );

  const topFiveIncentive = useMemo(
    () => [...revenueData].sort((a, b) => (b.incentive ?? 0) - (a.incentive ?? 0)).slice(0, 5),
    [revenueData]
  );

  return (
    <Card sx={{ height: "100%", borderRadius: { xs: 2, md: 3 }, boxShadow: 1 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          mb={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}
        >
          Revenue
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={32} sx={{ color: "primary.main" }} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && revenueData.length > 0 && (
          <>
            <RevenueTable
              data={revenueData}
              formatCurrency={formatCurrency}
              calculatePercentage={calculatePercentage}
            />

            <RevenueCharts
              topFiveRevenue={topFiveRevenue}
              topFiveBookings={topFiveBookings}
              topFiveIncentive={topFiveIncentive}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueSection;
