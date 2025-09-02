import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper
} from '@mui/material';
import { getAdminDashboard } from '../../DAL/dashboard'; 

const BookingsSection = ({ title, type }) => {
  const [filter, setFilter] = useState('daily');
  const [data, setData] = useState([]);

  // Fetch data when component mounts or filter changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminDashboard(filter); 
        const apiData = res.data?.data;

        let rows = [];
        if (type === 'agent') {
          rows = apiData.agent_wise_bookings.map(item => ({
            name: item.agent?.name,
            bookings: item.bookings
          }));
        } else if (type === 'source') {
          rows = apiData.source_wise_bookings.map(item => ({
            name: item.source?.name,
            bookings: item.bookings
          }));
        } else if (type === 'doctor') {
          rows = apiData.doctor_wise_bookings.map(item => ({
            name: item.doctor?.name,
            bookings: item.bookings
          }));
        }

        setData(rows);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };

    fetchData();
  }, [filter, type]);

  console.log("Filtered Data:", data);

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header with title & filter */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {title}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  backgroundColor: '#f5f5f5',
                  '&:hover': { backgroundColor: '#eeeeee' }
                }
              }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer component={MuiPaper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Sr#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {type === 'agent' ? 'Agent' : type === 'source' ? 'Source' : 'Doctor'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Bookings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#23C7B7' }}>
                    {row.bookings}
                  </TableCell>
                </TableRow>
              ))}

              {/* Empty state */}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default BookingsSection;
