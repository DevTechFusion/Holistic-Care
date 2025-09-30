import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const RevenueTable = ({ data, formatCurrency, calculatePercentage }) => {
  const headers = [
    "Sr#",
    "Agent",
    "Bookings",
    "Arrived",
    "No Show",
    "Arrived %",
    "Revenue",
    "Incentive",
  ];

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: "none",
        border: 1,
        borderColor: "divider",
        maxHeight: 250, // shows ~5 rows before scrolling
        overflowY: "auto",
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9fafb" }}>
            {headers.map((header, idx) => (
              <TableCell
                key={header}
                align="center"
                sx={{
                  fontWeight: "bold",
                  borderRight: idx !== headers.length - 1 ? "1px solid #e0e0e0" : "none",
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.agent_id ?? index}>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0" }}
              >
                {index + 1}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, borderRight: "1px solid #e0e0e0" }}
              >
                {row.agent?.name ?? "Unknown Agent"}
              </TableCell>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0" }}
              >
                {row.bookings ?? 0}
              </TableCell>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0" }}
              >
                {row.arrived ?? 0}
              </TableCell>
              <TableCell
                align="center"
                sx={{ borderRight: "1px solid #e0e0e0" }}
              >
                {row.no_show ?? 0}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                }}
              >
                {calculatePercentage(row.arrived, row.bookings)}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", borderRight: "1px solid #e0e0e0" }}
              >
                {formatCurrency(row.revenue)}
              </TableCell>
              <TableCell align="center" sx={{ color: "warning.main", fontWeight: "bold" }}>
                {formatCurrency(row.incentive)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RevenueTable;
