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

const BookingsSection = ({ title, type }) => {
  const [filter, setFilter] = useState('all');

  const getData = () => {
    switch (type) {
      case 'agent':
        return [
          { name: 'Rimsha Ali', bookings: '15' },
          { name: 'Ali Waqar', bookings: '12' },
          { name: 'Aqsa', bookings: '10' },
          { name: 'Jamshaid', bookings: '8' },
          { name: 'Rabia', bookings: '5' }
        ];
      case 'source':
        return [
          { name: 'Insta', bookings: '20' },
          { name: 'FB', bookings: '15' },
          { name: 'Whatsapp', bookings: '12' },
          { name: 'Direct', bookings: '8' },
          { name: 'Oladoc', bookings: '5' }
        ];
      case 'doctor':
        return [
          { name: 'Dr. Rimsha Ali', bookings: '18' },
          { name: 'Dr. Ali Waqar', bookings: '14' },
          { name: 'Dr. Aqsa', bookings: '11' },
          { name: 'Dr. Jamshaid', bookings: '9' },
          { name: 'Dr. Rabia', bookings: '6' }
        ];
      default:
        return [];
    }
  };

  const getFilterOptions = () => {
    switch (type) {
      case 'agent':
        return [
          { value: 'all', label: 'All Agents' },
          { value: 'top', label: 'Top Agents' },
          { value: 'new', label: 'New Agents' }
        ];
      case 'source':
        return [
          { value: 'all', label: 'All Sources' },
          { value: 'social', label: 'Social Media' },
          { value: 'direct', label: 'Direct' }
        ];
      case 'doctor':
        return [
          { value: 'all', label: 'All Doctors' },
          { value: 'cardiology', label: 'Cardiology' },
          { value: 'neurology', label: 'Neurology' }
        ];
      default:
        return [];
    }
  };

  const data = getData();
  const filterOptions = getFilterOptions();

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
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
                  '&:hover': {
                    backgroundColor: '#eeeeee',
                  }
                }
              }}
            >
              {filterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

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
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default BookingsSection; 