import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Chip
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import CreateModal from './CreateModal';

const CreateDoctorModal = ({ open, onClose, onSubmit, departments = [], procedures = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    procedures: [],
    availability: {
      monday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
      tuesday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
      wednesday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
      thursday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
      friday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
      saturday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' }
    }
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleProcedureChange = (procedure) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.includes(procedure)
        ? prev.procedures.filter(p => p !== procedure)
        : [...prev.procedures, procedure]
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.phone && formData.department && formData.procedures.length > 0) {
      onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        department: '',
        procedures: [],
        availability: {
          monday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
          tuesday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
          wednesday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
          thursday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
          friday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
          saturday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' }
        }
      });
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      name: '',
      phone: '',
      department: '',
      procedures: [],
      availability: {
        monday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
        tuesday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
        wednesday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
        thursday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
        friday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' },
        saturday: { available: false, startTime: '9:00 AM', endTime: '5:00 PM' }
      }
    });
    onClose();
  };

  const timeOptions = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
  ];

  return (
    <CreateModal
      open={open}
      onClose={handleClose}
      title="Create Doctor"
      maxWidth="md"
      actions={
        <>
          <Button
            onClick={handleClose}
            sx={{
              backgroundColor: 'white',
              color: 'text.primary',
              border: '1px solid #e0e0e0',
              textTransform: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#23C7B7',
              color: 'white',
              textTransform: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#1BA89A'
              }
            }}
          >
            Create Doctor
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Basic Information */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={handleChange('name')}
              fullWidth
              required
              placeholder="Dr. Iqra Jamil"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Phone No.*"
              value={formData.phone}
              onChange={handleChange('phone')}
              fullWidth
              required
              placeholder="0300-1231236"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl >
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department}
                onChange={handleChange('department')}
                label="Department"
                sx={{
                  borderRadius: 2
                }}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id || dept.name} value={dept.name}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl>
              <InputLabel>Procedures</InputLabel>
              <Select
                multiple
                value={formData.procedures}
                onChange={(e) => setFormData(prev => ({ ...prev, procedures: e.target.value }))}
                label="Procedures"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={value} 
                        size="small"
                        onDelete={() => handleProcedureChange(value)}
                        deleteIcon={<CloseIcon />}
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  borderRadius: 2
                }}
              >
                {procedures.map((proc) => (
                  <MenuItem key={proc.id || proc.name} value={proc.name}>
                    {proc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Availability Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
            Availability
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(formData.availability).map(([day, schedule]) => (
              <Grid item xs={12} md={6} key={day}>
                <Box sx={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2, 
                  p: 2,
                  backgroundColor: schedule.available ? '#f8f9fa' : 'white'
                }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={schedule.available}
                        onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                        sx={{ color: '#23C7B7' }}
                      />
                    }
                    label={
                      <Typography sx={{ 
                        fontWeight: 600, 
                        textTransform: 'capitalize',
                        color: schedule.available ? 'text.primary' : 'text.secondary'
                      }}>
                        {day}
                      </Typography>
                    }
                  />
                  
                  {schedule.available && (
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Start Time</InputLabel>
                          <Select
                            value={schedule.startTime}
                            onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                            label="Start Time"
                            sx={{ borderRadius: 1 }}
                          >
                            {timeOptions.map((time) => (
                              <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth size="small">
                          <InputLabel>End Time</InputLabel>
                          <Select
                            value={schedule.endTime}
                            onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                            label="End Time"
                            sx={{ borderRadius: 1 }}
                          >
                            {timeOptions.map((time) => (
                              <MenuItem key={time} value={time}>{time}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </CreateModal>
  );
};

export default CreateDoctorModal; 