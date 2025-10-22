import { Box, Typography } from '@mui/material';
import { useAuth } from "../../contexts/AuthContext";
  
const WelcomeSection = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 'bold', 
          color: 'text.primary',
          mb: { xs: 0.5, sm: 1 },
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
        }}
      >
        Welcome back, {user?.name || "User"}!
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' }
        }}
      >
        Let's get started!
      </Typography>
    </Box>
  );
};

export default WelcomeSection; 