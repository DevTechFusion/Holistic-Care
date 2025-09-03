import { useState, useEffect } from 'react';
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
  Paper as MuiPaper,
  CircularProgress
} from '@mui/material';
import { getAdminDashboard } from '../../DAL/dashboard';

const RevenueSection = () => {
  const [revenueType, setRevenueType] = useState('pharmacy');
  const [revenueData, setRevenueData] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('weekly');

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const response = await getAdminDashboard(range);
        if (response?.status === "success") {
          setRevenueData(response.data.revenue?.rows || []);
          setTotals(response.data.revenue?.totals || {});
        }
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [range]);

  const calculatePercentage = (arrived, bookings) => {
    if (!bookings || bookings === 0) return 'NIL';
    return `${Math.round((parseInt(arrived) / parseInt(bookings)) * 100)}%`;
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === '0' || amount === 0) return '0';
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Revenue
          </Typography>

        </Box>

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Revenue Table */}
          <Box sx={{ flex: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={28} sx={{ color: '#23C7B7' }} />
              </Box>
            ) : (
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
                    {revenueData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No revenue data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      revenueData.map((row, index) => (
                        <TableRow key={`${row.agent_id}-${index}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {row.agent?.name || 'Unknown Agent'}
                          </TableCell>
                          <TableCell>{row.bookings || 0}</TableCell>
                          <TableCell>{row.arrived || 0}</TableCell>
                          <TableCell>{row.no_show || 0}</TableCell>
                          <TableCell sx={{ color: '#23C7B7', fontWeight: 'bold' }}>
                            {calculatePercentage(row.arrived, row.bookings)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(row.revenue)}
                          </TableCell>
                          <TableCell sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                            {formatCurrency(row.incentive)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
      
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Chart Space - Reserved for future donut chart */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: 250,
            backgroundColor: '#f9f9f9',
            borderRadius: 2,
            border: '2px dashed #e0e0e0'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Chart Area
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Donut Chart will be added here
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueSection;