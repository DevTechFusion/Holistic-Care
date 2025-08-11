import React from 'react';
import { Box, Typography } from '@mui/material';

const WelcomeSection = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'text.primary',
          mb: 1
        }}
      >
        Welcome back, Alina!
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.secondary',
          fontSize: '1.1rem'
        }}
      >
        Lorem ipsum sajbab dj daoweiaoi
      </Typography>
    </Box>
  );
};

export default WelcomeSection; 