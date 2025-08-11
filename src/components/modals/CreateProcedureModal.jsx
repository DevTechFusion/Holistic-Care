import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button
} from '@mui/material';
import CreateModal from './CreateModal';

const CreateProcedureModal = ({ open, onClose, onSubmit }) => {
  const [procedureName, setProcedureName] = useState('');

  const handleSubmit = () => {
    if (procedureName.trim()) {
      onSubmit({ name: procedureName.trim() });
      setProcedureName('');
      onClose();
    }
  };

  const handleClose = () => {
    setProcedureName('');
    onClose();
  };

  return (
    <CreateModal
      open={open}
      onClose={handleClose}
      title="Create Procedure"
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
            Create
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Procedure"
          value={procedureName}
          onChange={(e) => setProcedureName(e.target.value)}
          fullWidth
          required
          marginTop='12'
          placeholder="e.g., Laser hair removal, Carbon facial, Lip laser"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              marginTop: 2
            }
          }}
        />
      </Box>
    </CreateModal>
  );
};

export default CreateProcedureModal; 