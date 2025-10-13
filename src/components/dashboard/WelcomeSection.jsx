import { Box, Typography } from '@mui/material';
import { useAuth } from "../../contexts/AuthContext";
  
const WelcomeSection = () => {
  const { user } = useAuth();

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
        Welcome back, {user?.name || "User"}!
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.secondary',
          fontSize: '1.1rem'
        }}
      >
        Let's get started!
      </Typography>
    </Box>
  );
};

export default WelcomeSection; 