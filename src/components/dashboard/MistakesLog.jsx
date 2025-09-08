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
  Chip,
} from "@mui/material";
import { getManagerDashboard } from "../../DAL/dashboard";

export default function MistakeLogTable() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getManagerDashboard("weekly");
        if (res?.data?.detailed_log?.data) {
          setLogs(res.data.detailed_log.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load mistake logs");
      }
    };

    fetchLogs();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); 
  };

  const formatDay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Detailed Mistake Log
      </Typography>

      {error ? (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} hover>
                <TableCell>{formatDate(log.occurred_at)}</TableCell>
                <TableCell>{formatDay(log.occurred_at)}</TableCell>
                <TableCell>{log.agent?.name}</TableCell>
                <TableCell sx={{ color: "red" }}>
                  {log.complaint_type?.name}
                </TableCell>
                <TableCell>{log.platform}</TableCell>
                <TableCell>{log.description}</TableCell>
                <TableCell>
                  <Chip
                    label={log.is_resolved ? "Resolved" : "Pending"}
                    color={log.is_resolved ? "success" : "warning"}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
