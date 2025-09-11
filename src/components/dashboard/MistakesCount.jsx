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
} from "@mui/material";
import { getManagerDashboard } from "../../DAL/dashboard";

export default function MistakesCount({filter}) {
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

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Mistake Count by Agent
      </Typography>

      {error ? (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      ) : (
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
      )}
    </TableContainer>
  );
}
