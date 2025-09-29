import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { getManagerDashboard } from "../../DAL/dashboard";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MistakesCount({ filter }) {
  const [count, setCount] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await getManagerDashboard(filter);
        if (res?.data?.mistake_count_by_agent) {
          setCount(res.data.mistake_count_by_agent);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load mistake count");
      }
    };

    fetchCount();
  }, [filter]);

  // Prepare pie chart data
  const mistakeTypes = ["Missed reply", "Disinformation", "Incomplete Chat", "Retargeting"];
  const aggregatedCounts = mistakeTypes.map(
    (type) => count.reduce((sum, row) => sum + (row[type] || 0), 0)
  );

  const pieData = {
    labels: mistakeTypes,
    datasets: [
      {
        data: aggregatedCounts,
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Mistake Count by Agent
      </Typography>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {/* Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell>Missed Reply</TableCell>
                <TableCell>Disinformation</TableCell>
                <TableCell>Incomplete Chat</TableCell>
                <TableCell>Retargeting</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {count
                .filter((row) => row.agent_id)
                .map((row) => (
                  <TableRow key={row.agent_id}>
                    <TableCell>{row.agent_name}</TableCell>
                    <TableCell>{row["Missed reply"] || "-"}</TableCell>
                    <TableCell>{row["Disinformation"] || "-"}</TableCell>
                    <TableCell>{row["Incomplete Chat"] || "-"}</TableCell>
                    <TableCell>{row["Retargeting"] || "-"}</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "teal" }}>
                      {row.total}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Pie Chart */}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Box sx={{ width: 350 }}>
              <Pie data={pieData} />
            </Box>
          </Box>
        </>
      )}
    </TableContainer>
  );
}
