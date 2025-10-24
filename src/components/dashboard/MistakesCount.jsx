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
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import { getManagerDashboard } from "../../DAL/dashboard";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MistakesCount({ filter }) {
  const [count, setCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTypes, setActiveTypes] = useState({});

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getManagerDashboard(filter);
        if (res?.data?.mistake_count_by_agent) {
          setCount(res.data.mistake_count_by_agent);
        } else {
          setCount([]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load mistake count");
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [filter]);

  const mistakeTypes = [
    { key: "Missed reply", color: "#ec3058ff" },
    { key: "Disinformation", color: "#36A2EB" },
    { key: "Incomplete Chat", color: "#FFCE56" },
    { key: "Retargeting", color: "#4CAF50" },
  ];

  useEffect(() => {
    setActiveTypes(
      mistakeTypes.reduce((acc, t) => {
        acc[t.key] = true;
        return acc;
      }, {})
    );
  }, []);

  const aggregatedCounts = mistakeTypes.map((t) =>
    activeTypes[t.key]
      ? count.reduce((sum, row) => sum + (row[t.key] || 0), 0)
      : 0
  );

  const pieData = {
    labels: mistakeTypes.map((t) => t.key),
    datasets: [
      {
        data: aggregatedCounts,
        backgroundColor: mistakeTypes.map((t) =>
          activeTypes[t.key] ? t.color : "#e0e0e0"
        ),
        borderColor: "#ffffff",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions = {
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      }
    },
    maintainAspectRatio: true,
    responsive: true,
  };

  const toggleType = (type) => {
    setActiveTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <Card
      sx={{
        mt: { xs: 2, sm: 3 },
        borderRadius: 4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "100%",
        background: "linear-gradient(to bottom, #ffffff, #fafafa)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            mb: { xs: 2, sm: 3, md: 4 },
            color: "#1a1a1a",
            letterSpacing: "-0.5px",
            fontSize: { xs: "1.25rem", sm: "1.5rem" }
          }}
        >
          Mistake Count by Agent
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={48} thickness={4} />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              fontSize: "0.95rem"
            }}
          >
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: { xs: 3, sm: 4, lg: 5 },
              alignItems: { xs: "stretch", lg: "flex-start" },
              width: "100%",
              maxWidth: "100%",
            }}
          >
            {/* Enhanced Table */}
            <TableContainer
              component={MuiPaper}
              sx={{
                flex: 1,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: "1px solid #e8e8e8",
                borderRadius: 3,
                maxHeight: { xs: 400, sm: 500, lg: 550 },
                overflowY: "auto",
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#c1c1c1",
                  borderRadius: "4px",
                  "&:hover": {
                    background: "#a8a8a8",
                  },
                },
              }}
            >
              <Table size="medium" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#2d3748",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #e0e0e0",
                        borderRight: "1px solid #e0e0e0",
                        py: 2.5,
                        px: 3,
                        minWidth: { xs: "120px", sm: "160px" },
                      }}
                    >
                      Agent
                    </TableCell>
                    {mistakeTypes.map((t) => (
                      <TableCell
                        key={t.key}
                        align="center"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: "#2d3748",
                          backgroundColor: "#f8f9fa",
                          borderBottom: "2px solid #e0e0e0",
                          borderRight: "1px solid #e0e0e0",
                          py: 2.5,
                          px: 3,
                          minWidth: { xs: "100px", sm: "140px" },
                        }}
                      >
                        {t.key}
                      </TableCell>
                    ))}
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#2d3748",
                        backgroundColor: "#f8f9fa",
                        borderBottom: "2px solid #e0e0e0",
                        py: 2.5,
                        px: 3,
                        minWidth: { xs: "80px", sm: "120px" },
                      }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {count.length > 0 ? (
                    count
                      .filter((row) => row.agent_id)
                      .map((row, idx) => (
                        <TableRow 
                          key={row.agent_id} 
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor: "#f5f7fa",
                            },
                            "&:last-child td": {
                              borderBottom: 0,
                            },
                            backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fafbfc",
                          }}
                        >
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "#1a202c",
                              borderRight: "1px solid #e0e0e0",
                              py: 2.5,
                              px: 3,
                            }}
                          >
                            {row.agent_name}
                          </TableCell>
                          {mistakeTypes.map((t) => (
                            <TableCell
                              key={t.key}
                              align="center"
                              sx={{
                                py: 2.5,
                                px: 3,
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                borderRight: "1px solid #e0e0e0",
                                color: activeTypes[t.key] ? t.color : "#9e9e9e",
                                textDecoration: activeTypes[t.key]
                                  ? "none"
                                  : "line-through",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {row[t.key] || "-"}
                            </TableCell>
                          ))}
                          <TableCell
                            align="center"
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: "0.95rem",
                              color: "#23C7B7",
                              py: 2.5,
                              px: 3,
                            }}
                          >
                            {row.total}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={mistakeTypes.length + 2}
                        align="center"
                        sx={{ py: 6, color: "#718096", fontSize: "0.95rem" }}
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Enhanced Chart + Legend */}
            <Box
              sx={{
                width: { xs: "100%", lg: 380 },
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 0,
              }}
            >
              <Box sx={{ width: "100%", maxWidth: { xs: 240, sm: 280 }, mb: 3 }}>
                <Pie data={pieData} options={pieOptions} />
              </Box>

              {/* Enhanced Interactive Legend */}
              <Box 
                sx={{ 
                  width: "100%",
                  display: "flex", 
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {mistakeTypes.map((t, idx) => (
                  <Box
                    key={t.key}
                    onClick={() => toggleType(t.key)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      cursor: "pointer",
                      opacity: activeTypes[t.key] ? 1 : 0.5,
                      backgroundColor: activeTypes[t.key] ? "#f8f9fa" : "#fafafa",
                      border: `1px solid ${activeTypes[t.key] ? t.color + "40" : "#e0e0e0"}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: activeTypes[t.key] ? "#f0f1f3" : "#f5f5f5",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "4px",
                          backgroundColor: activeTypes[t.key] ? t.color : "#d0d0d0",
                          boxShadow: activeTypes[t.key] ? `0 2px 8px ${t.color}40` : "none",
                          transition: "all 0.2s ease",
                        }}
                      />
                      <Typography 
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: activeTypes[t.key] ? "#2d3748" : "#9e9e9e",
                          fontSize: "0.9rem",
                        }}
                      >
                        {t.key}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: activeTypes[t.key] ? t.color : "#9e9e9e",
                        fontSize: "1.1rem",
                      }}
                    >
                      {aggregatedCounts[idx]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}