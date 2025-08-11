import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCards = () => {
  const stats = [
    {
      title: 'Total Bookings',
      value: '50',
      change: '+13.3%',
      isPositive: true,
      color: '#23C7B7'
    },
    {
      title: 'Arrived Today',
      value: '16',
      change: '-13.3%',
      isPositive: false,
      color: '#F56565'
    },
    {
      title: 'Not Arrived',
      value: '32',
      change: '+13.3%',
      isPositive: true,
      color: '#23C7B7'
    },
    {
      title: 'Rescheduled',
      value: '25',
      change: '+13.3%',
      isPositive: true,
      color: '#23C7B7'
    }
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: stat.color,
                  mb: 1
                }}
              >
                {stat.value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 2
                }}
              >
                {stat.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {stat.isPositive ? (
                  <TrendingUp sx={{ color: '#23C7B7', fontSize: 20 }} />
                ) : (
                  <TrendingDown sx={{ color: '#F56565', fontSize: 20 }} />
                )}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: stat.isPositive ? '#23C7B7' : '#F56565',
                    fontWeight: 600
                  }}
                >
                  {stat.change}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards; 