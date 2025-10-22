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
        maxHeight: { xs: 300, sm: 240 },
        overflowY: "auto",
        overflowX: "auto",
      }}
    >
      <Table fixed size="small" sx={{ minWidth: { xs: 650, sm: "auto" } }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f9fafb" }}>
            {headers.map((header, idx) => (
              <TableCell
                key={header}
                align="center"
                sx={{
                  fontWeight: "bold",
                  borderRight: idx !== headers.length - 1 ? "1px solid #e0e0e0" : "none",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                  px: { xs: 1, sm: 2 }
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
                sx={{ 
                  borderRight: "1px solid #e0e0e0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {index + 1}
              </TableCell>
              <TableCell
                align="center"
                sx={{ 
                  fontWeight: 600, 
                  borderRight: "1px solid #e0e0e0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                  px: { xs: 1, sm: 2 }
                }}
              >
                {row.agent?.name ?? "Unknown Agent"}
              </TableCell>
              <TableCell
                align="center"
                sx={{ 
                  borderRight: "1px solid #e0e0e0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {row.bookings ?? 0}
              </TableCell>
              <TableCell
                align="center"
                sx={{ 
                  borderRight: "1px solid #e0e0e0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {row.arrived ?? 0}
              </TableCell>
              <TableCell
                align="center"
                sx={{ 
                  borderRight: "1px solid #e0e0e0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {row.no_show ?? 0}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  borderRight: "1px solid #e0e0e0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 1, sm: 2 }
                }}
              >
                {calculatePercentage(row.arrived, row.bookings)}
              </TableCell>
              <TableCell
                align="center"
                sx={{ 
                  fontWeight: "bold", 
                  borderRight: "1px solid #e0e0e0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                  px: { xs: 1, sm: 2 }
                }}
              >
                {formatCurrency(row.revenue)}
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  color: "warning.main", 
                  fontWeight: "bold",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  whiteSpace: "nowrap",
                  px: { xs: 1, sm: 2 }
                }}
              >
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
