import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button
} from '@mui/material';
import CreateModal from './CreateModal';

const CreateDepartmentModal = ({ open, onClose, onSubmit }) => {
  const [departmentName, setDepartmentName] = useState('');

  const handleSubmit = () => {
    if (departmentName.trim()) {
      onSubmit({ name: departmentName.trim() });
      setDepartmentName('');
      onClose();
    }
  };

  const handleClose = () => {
    setDepartmentName('');
    onClose();
  };

  return (
    <CreateModal
      open={open}
      onClose={handleClose}
      title="Create Department"
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
              backgroundColor: '#4CAF50',
              color: 'white',
              textTransform: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            Create
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Department"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          fullWidth
          required
          placeholder="e.g., Dermatology, Cardiology, Neurology"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />
      </Box>
    </CreateModal>
  );
};

export default CreateDepartmentModal; 