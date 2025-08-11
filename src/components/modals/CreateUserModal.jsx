import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import CreateModal from './CreateModal';

const CreateUserModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.password && formData.role) {
      onSubmit(formData);
      setFormData({ name: '', email: '', password: '', role: '' });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '', role: '' });
    onClose();
  };

  return (
    <CreateModal
      open={open}
      onClose={handleClose}
      title="Create User"
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
            Create User
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={handleChange('name')}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        
        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        
        <TextField
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
        
        <FormControl fullWidth required>
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.role}
            onChange={handleChange('role')}
            label="Role"
            sx={{
              borderRadius: 2
            }}
          >
            <MenuItem value="agent">Agent</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </CreateModal>
  );
};

export default CreateUserModal; 