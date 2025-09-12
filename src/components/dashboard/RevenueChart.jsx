import { useMemo } from "react";
import { Box, Typography, CircularProgress, Card, CardContent, Fade, Grid } from "@mui/material";
import CanvasJSReact from "@canvasjs/react-charts";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const RevenueChart = ({ data, loading }) => {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const chartColors = ["#1a73e8", "#4285f4", "#fbbc05", "#34a853", "#ea4335", "#c5d0e6", "#5f6368"];

  // Helper function to generate chart options and reduce code duplication
  const generateChartOptions = (key, title, unit) => {
    const dataPoints = data.map((row) => ({
      name: row.agent?.name || "Unknown",
      y: Number(row[key]) || 0,
    }));
    const total = data.reduce((sum, r) => sum + (Number(r[key]) || 0), 0);

    return {
      animationEnabled: true,
      backgroundColor: "transparent",
      height: 300,
      toolTip: {
        fontSize: 14,
        content: `<b>{name}</b><br/>{y}${unit === "currency" ? " PKR" : " bookings"}<br/>(#percent%)`,
      },
      subtitles: [
        {
          text: `Total: ${unit === "currency" ? formatCurrency(total) : `${total} bookings`}`,
          verticalAlign: "center",
          fontSize: 16,
          fontColor: "#475569",
          dockInsidePlotArea: true,
        },
      ],
      data: [
        {
          type: "doughnut",
          showInLegend: true,
          legendText: "{name}",
          indexLabel: "{name}: {y} (#percent%)",
          indexLabelFontColor: "#1e293b",
          indexLabelFontSize: 12,
          yValueFormatString: unit === "currency" ? "₨#,###" : "#,### bookings",
          dataPoints,
          colors: chartColors,
        },
      ],
    };
  };

  const revenueOptions = useMemo(
    () => generateChartOptions("revenue", "Revenue by Agent", "currency"),
    [data]
  );
  const bookingOptions = useMemo(
    () => generateChartOptions("bookings", "Bookings by Agent", "bookings"),
    [data]
  );

  const renderChartContent = (options) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress size={40} sx={{ color: "#23C7B7" }} />
        </Box>
      );
    }

    if (data.length === 0) {
      return (
        <Fade in>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight={300}
            sx={{ color: "#94a3b8" }}
          >
            <InsertChartOutlinedIcon sx={{ fontSize: 56, mb: 1, color: "#cbd5e1" }} />
            <Typography variant="body1" sx={{ fontWeight: "500", color: "#94a3b8" }}>
              No data available
            </Typography>
          </Box>
        </Fade>
      );
    }

    return (
      <Box sx={{ width: "100%", height: "100%" }}>
        <CanvasJSChart options={options} />
      </Box>
    );
  };

  return (
    <Grid container spacing={4}>
      {/* Revenue Chart Card */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={4}
          sx={{
            borderRadius: 3,
            boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
            p: 2,
            height: "100%",
            backgroundColor: "#f9fafb",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 16px 32px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease-in-out",
            },
          }}
        >
          <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, textAlign: "center", color: "#1e293b" }}>
              Revenue by Agent
            </Typography>
            {renderChartContent(revenueOptions)}
          </CardContent>
        </Card>
      </Grid>

      {/* Bookings Chart Card */}
      <Grid item xs={12} md={6}>
        <Card
          elevation={4}
          sx={{
            borderRadius: 3,
            boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
            p: 2,
            height: "100%",
            backgroundColor: "#f9fafb",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 16px 32px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease-in-out",
            },
          }}
        >
          <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, textAlign: "center", color: "#1e293b" }}>
              Bookings by Agent
            </Typography>
            {renderChartContent(bookingOptions)}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RevenueChart;