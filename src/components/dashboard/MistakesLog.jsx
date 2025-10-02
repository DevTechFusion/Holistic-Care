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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
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

  const truncateText = (text, limit = 50) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  return (
    <>
      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
            Detailed Mistake Log
          </Typography>

          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer
              component={MuiPaper}
              sx={{ boxShadow: "none", border: "1px solid #e0e0e0" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}
                    >
                      Day
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}
                    >
                      Agent
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0", color: "red" }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}
                    >
                      Description
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                          {formatDate(log.occurred_at)}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                          {formatDay(log.occurred_at)}
                        </TableCell>
                        <TableCell align="center" sx={{ borderRight: "1px solid #e0e0e0" }}>
                          {log.agent?.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ borderRight: "1px solid #e0e0e0", color: "red", fontWeight: 600 }}
                        >
                          {log.complaint_type?.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                            cursor: log.description?.length > 50 ? "pointer" : "default",
                            color: log.description?.length > 50 ? "primary.main" : "inherit",
                          }}
                          onClick={() =>
                            log.description?.length > 50 &&
                            setSelectedDescription(log.description)
                          }
                        >
                          {truncateText(log.description)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={log.is_resolved ? "Resolved" : "Pending"}
                            color={log.is_resolved ? "success" : "warning"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 3, color: "text.secondary" }}
                      >
                        No logs available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal for full description */}
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
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
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
