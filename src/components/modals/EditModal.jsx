import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const EditModal = ({ 
  open, 
  onClose, 
  title, 
  children, 
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  onSave,
  onCancel,
  saveText = "Save Changes",
  cancelText = "Cancel",
  loading = false
}) => {
  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const defaultActions = (
    <>
      <Button
        onClick={handleCancel}
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
        {cancelText}
      </Button>
      <Button
        onClick={handleSave}
        variant="contained"
        disabled={loading}
        sx={{
          backgroundColor: '#2196F3',
          color: 'white',
          textTransform: 'none',
          px: 3,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#1976D2'
          }
        }}
      >
        {loading ? 'Saving...' : saveText}
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: 'text.primary' 
        }}>
          {title}
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {children}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
        {actions || defaultActions}
      </DialogActions>
    </Dialog>
  );
};

export default EditModal; 