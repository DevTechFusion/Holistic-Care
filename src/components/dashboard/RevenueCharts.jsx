import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";
import { useLayout } from "../../contexts/LayoutContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenueCharts = ({ topFiveRevenue, topFiveBookings, topFiveIncentive }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const { isSidebarOpen } = useLayout();
  const [containerWidth, setContainerWidth] = useState('100%');
  const chartRefs = useRef([]);
  const containerRef = useRef(null);

  // Update chart dimensions when sidebar state changes
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    // Initial dimension setup
    updateDimensions();
    
    // Add resize event listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
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
  }, [updateDimensions]);

  // Update dimensions when sidebar state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateDimensions();
    }, theme.transitions.duration.leavingScreen);
    
    return () => clearTimeout(timer);
  }, [isSidebarOpen, theme.transitions.duration.leavingScreen, updateDimensions]);

  const generateChartData = (dataset, labelKey) => ({
    labels: dataset.map((row) => row.agent?.name ?? "Unknown Agent"),
    datasets: [
      {
        label: labelKey,
        data: dataset.map((row) => row[labelKey] ?? 0),
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#6366F1"],
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: isMobile ? 10 : 12,
          }
        }
      },
    },
  };

  const charts = [
    { title: "Top 5 by Revenue", data: topFiveRevenue, key: "revenue" },
    { title: "Top 5 by Bookings", data: topFiveBookings, key: "bookings" },
    { title: "Top 5 by Incentive", data: topFiveIncentive, key: "incentive" },
  ];

  // Calculate grid columns based on screen size and sidebar state
  const getGridTemplateColumns = () => {
    if (isMobile) return '1fr';
    if (isTablet) return isSidebarOpen ? '1fr' : 'repeat(2, 1fr)';
    return isSidebarOpen ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';
  };

  return (
    <Box 
      ref={containerRef}
      sx={{
        width: '100%',
        transition: theme.transitions.create('all', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Box
        display="grid"
        gridTemplateColumns={getGridTemplateColumns()}
        gap={3}
        mt={3}
        sx={{
          transition: theme.transitions.create('grid-template-columns', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {charts.map((chart, index) => (
          <motion.div
            key={chart.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{ 
              textAlign: 'center',
              minWidth: 0, // Prevent flex item from overflowing
            }}
          >
            <Typography 
              variant="subtitle1" 
              fontWeight="bold" 
              mb={1}
              sx={{
                fontSize: isMobile ? '0.875rem' : '1rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {chart.title}
            </Typography>

            <Box
              sx={{
                height: { 
                  xs: 220, 
                  sm: 250, 
                  md: isSidebarOpen ? 250 : 280, 
                  lg: isSidebarOpen ? 280 : 300 
                },
                width: '100%',
                maxWidth: '100%',
                mx: 'auto',
                p: 1,
              }}
            >
              <Doughnut
                data={generateChartData(chart.data, chart.key)}
                options={{
                  ...chartOptions,
                  // Update chart on container width change
                  onResize: (chart, size) => {
                    chart.resize();
                  }
                }}
                redraw={false}
                updateMode='resize'
                ref={(el) => {
                  if (el?.canvas) chartRefs.current[index] = el;
                }}
              />
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default RevenueCharts;
