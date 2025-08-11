import React, { useState } from 'react';
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

const RevenueSection = () => {
  const [revenueType, setRevenueType] = useState('pharmacy');

  const revenueData = [
    {
      agent: 'Rimsha Ali',
      bookings: '25',
      arrived: '20',
      noShow: '5',
      percentage: '80%',
      revenue: '$2,500',
      incentive: '$250'
    },
    {
      agent: 'Asad Ali',
      bookings: '30',
      arrived: '24',
      noShow: '6',
      percentage: '80%',
      revenue: '$3,000',
      incentive: '$300'
    }
  ];

  const chartData = [
    { label: 'Total Bookings', value: 50, color: '#23C7B7' },
    { label: 'Total Incentive', value: 20, color: '#FF9800' },
    { label: 'Total Arrived', value: 20, color: '#2196F3' },
    { label: 'Total Revenue', value: 10, color: '#4CAF50' }
  ];

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Revenue
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={revenueType}
              onChange={(e) => setRevenueType(e.target.value)}
              sx={{
                '& .MuiSelect-select': {
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#eeeeee',
                  }
                }
              }}
            >
              <MenuItem value="pharmacy">Pharmacy - Delivered Ratio / Revenue</MenuItem>
              <MenuItem value="consultation">Consultation - Delivered Ratio / Revenue</MenuItem>
              <MenuItem value="procedure">Procedure - Delivered Ratio / Revenue</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Revenue Table */}
          <Box sx={{ flex: 1 }}>
            <TableContainer component={MuiPaper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Sr#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Bookings</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Arrived</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>No Show</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>%age</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Revenue</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Incentive</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenueData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.agent}</TableCell>
                      <TableCell>{row.bookings}</TableCell>
                      <TableCell>{row.arrived}</TableCell>
                      <TableCell>{row.noShow}</TableCell>
                      <TableCell sx={{ color: '#23C7B7', fontWeight: 'bold' }}>{row.percentage}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{row.revenue}</TableCell>
                      <TableCell sx={{ color: '#FF9800', fontWeight: 'bold' }}>{row.incentive}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Donut Chart and Legend */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 200 }}>
            {/* Simple Donut Chart Representation */}
            <Box sx={{ position: 'relative', width: 120, height: 120, mb: 2 }}>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '8px solid #e0e0e0',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {chartData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: `8px solid ${item.color}`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + (index * 25)}% 0%, ${50 + (index * 25)}% 100%, 50% 100%)`
                    }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  {chartData.reduce((sum, item) => sum + item.value, 0)}
                </Typography>
              </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {chartData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: item.color
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.label} ({item.value})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueSection; 