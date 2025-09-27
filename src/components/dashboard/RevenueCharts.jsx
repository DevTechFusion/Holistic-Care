import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenueCharts = ({ topFiveRevenue, topFiveBookings, topFiveIncentive }) => {
  const chartRefs = useRef([]);

  useEffect(() => {
    // Cleanup to avoid "Canvas already in use" errors
    return () => {
      chartRefs.current.forEach((chart) => {
        if (chart?.destroy) {
          try {
            chart.destroy();
          } catch (err) {
            console.warn("Chart already destroyed:", err.message);
          }
        }
      });
      chartRefs.current = [];
    };
  }, []);

  const generateChartData = (dataset, labelKey) => ({
    labels: dataset.map((row) => row.agent?.name ?? "Unknown Agent"),
    datasets: [
      {
        label: labelKey,
        data: dataset.map((row) => row[labelKey] ?? 0),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // important for responsive resizing
    plugins: {
      legend: { position: "bottom" },
    },
  };

  const charts = [
    { title: "Top 5 Agents by Revenue", data: topFiveRevenue, key: "revenue" },
    { title: "Top 5 Agents by Bookings", data: topFiveBookings, key: "bookings" },
    { title: "Top 5 Agents by Incentive", data: topFiveIncentive, key: "incentive" },
  ];

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
      gap={3}
      mt={3}
    >
      {charts.map((chart, index) => (
        <motion.div
          key={chart.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          style={{ textAlign: "center" }}
        >
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            {chart.title}
          </Typography>

          {/* ✅ Responsive height: smaller on mobile, bigger on desktop */}
          <Box
            sx={{
              height: { xs: 220, sm: 250, md: 280, lg: 300 },
              maxWidth: "100%",
              mx: "auto",
            }}
          >
            <Doughnut
              data={generateChartData(chart.data, chart.key)}
              options={chartOptions}
              ref={(el) => {
                if (el?.canvas) chartRefs.current[index] = el;
              }}
            />
          </Box>
        </motion.div>
      ))}
    </Box>
  );
};

export default RevenueCharts;
