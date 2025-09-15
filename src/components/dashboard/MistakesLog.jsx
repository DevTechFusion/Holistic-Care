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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { getManagerDashboard } from "../../DAL/dashboard";

export default function MistakeLogTable({ filter }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  // For modal
  const [selectedDescription, setSelectedDescription] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getManagerDashboard(filter);
        if (res?.data?.detailed_log?.data) {
          // ✅ Filter out logs with null agent_id
          const filteredLogs = res.data.detailed_log.data.filter(
            (log) => log.agent_id !== null
          );
          setLogs(filteredLogs);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load mistake logs");
      }
    };

    fetchLogs();
  }, [filter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const formatDay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Truncate long text for table display
  const truncateText = (text, limit = 50) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  return (
    <>
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

                  <TableCell
                    sx={{
                      cursor: log.description?.length > 50 ? "pointer" : "default",
                    }}
                    onClick={() =>
                      log.description?.length > 50 &&
                      setSelectedDescription(log.description)
                    }
                  >
                    {truncateText(log.description)}
                  </TableCell>

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

      {/* Modal for full description with proper word wrap */}
      <Dialog
        open={Boolean(selectedDescription)}
        onClose={() => setSelectedDescription(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complaint Description</DialogTitle>
        <DialogContent dividers>
          <Typography
            sx={{
              whiteSpace: "pre-wrap", // ✅ keeps line breaks, wraps text
              wordBreak: "break-word", // ✅ breaks very long words/URLs
              overflowWrap: "anywhere", // ✅ ensures no overflow
            }}
          >
            {selectedDescription}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDescription(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
