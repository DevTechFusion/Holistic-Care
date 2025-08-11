import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';

const DoctorLeaderboard = () => {
  const [specialty, setSpecialty] = useState('cardiology');

  const doctors = [
    {
      name: 'Dr. Nimra',
      avatar: 'DN',
      bookings: '01',
      agent: null
    },
    {
      name: 'Dr. Sahar',
      avatar: 'DS',
      bookings: '01',
      agent: 'Asim'
    },
    {
      name: 'Dr. Alina',
      avatar: 'DA',
      bookings: '01',
      agent: 'Asim'
    },
    {
      name: 'Dr. Arooj',
      avatar: 'DA',
      bookings: '01',
      agent: 'Asim'
    }
  ];

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Doctor Booking Leaderboard
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
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
              <MenuItem value="cardiology">Cardiology</MenuItem>
              <MenuItem value="neurology">Neurology</MenuItem>
              <MenuItem value="orthopedics">Orthopedics</MenuItem>
              <MenuItem value="dermatology">Dermatology</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <List sx={{ p: 0 }}>
          {doctors.map((doctor, index) => (
            <ListItem 
              key={index} 
              sx={{ 
                px: 0, 
                py: 1,
                borderBottom: index < doctors.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    backgroundColor: '#23C7B7',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {doctor.avatar}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={doctor.name}
                secondary={doctor.agent ? `Agent: ${doctor.agent}` : null}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                    color: 'text.primary'
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'text.secondary',
                    fontSize: '0.875rem'
                  }
                }}
              />
              <ListItemSecondaryAction>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  Bookings: {doctor.bookings}
                </Typography>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default DoctorLeaderboard; 