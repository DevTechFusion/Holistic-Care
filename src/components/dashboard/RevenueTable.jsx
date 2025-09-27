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
        <TableHead sx={{ backgroundColor: "#f9fafb" }}>
          <TableRow>
            {[
              "Sr#",
              "Agent",
              "Bookings",
              "Arrived",
              "No Show",
              "Arrived %",
              "Revenue",
              "Incentive",
            ].map((header) => (
              <TableCell key={header} sx={{ fontWeight: "bold" }}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.agent_id ?? index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {row.agent?.name ?? "Unknown Agent"}
              </TableCell>
              <TableCell>{row.bookings ?? 0}</TableCell>
              <TableCell>{row.arrived ?? 0}</TableCell>
              <TableCell>{row.no_show ?? 0}</TableCell>
              <TableCell sx={{ color: "primary.main", fontWeight: "bold" }}>
                {calculatePercentage(row.arrived, row.bookings)}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {formatCurrency(row.revenue)}
              </TableCell>
              <TableCell sx={{ color: "warning.main", fontWeight: "bold" }}>
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
