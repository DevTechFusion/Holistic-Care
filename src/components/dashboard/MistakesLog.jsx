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


export default function MistakeLogTable({ startDate, endDate }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  // For modal
  const [selectedDescription, setSelectedDescription] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getManagerDashboard(startDate, endDate);
        if (res?.data?.detailed_log?.data) {
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
  }, [startDate, endDate]);

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
          mt: { xs: 2, sm: 3 },
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: "1.125rem", sm: "1.25rem" },
            }}
          >
            Detailed Mistake Log
          </Typography>

          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <TableContainer
              component={MuiPaper}
              sx={{
                boxShadow: "none",
                border: "1px solid #e0e0e0",
                overflowX: "auto",
              }}
            >
              <Table size="small" sx={{ minWidth: { xs: 600, sm: 650 } }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        borderRight: "1px solid #e0e0e0",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        borderRight: "1px solid #e0e0e0",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Day
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        borderRight: "1px solid #e0e0e0",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Agent
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        borderRight: "1px solid #e0e0e0",
                        color: "red",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        borderRight: "1px solid #e0e0e0",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Description
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 1, sm: 2 },
                      }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {formatDate(log.occurred_at)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {formatDay(log.occurred_at)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {log.agent?.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                            color: "red",
                            fontWeight: 600,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                        >
                          {log.complaint_type?.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                            cursor:
                              log.description?.length > 50
                                ? "pointer"
                                : "default",
                            color:
                              log.description?.length > 50
                                ? "primary.main"
                                : "inherit",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                          onClick={() =>
                            log.description?.length > 50 &&
                            setSelectedDescription(log.description)
                          }
                        >
                          {truncateText(log.description)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            px: { xs: 1, sm: 2 },
                          }}
                        >
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
