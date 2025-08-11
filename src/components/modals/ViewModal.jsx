import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Button,
  Typography,
  Divider
} from '@mui/material';
import { Close as CloseIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const ViewModal = ({ 
  open, 
  onClose, 
  title = "View Details",
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true,
  onEdit,
  onDelete,
  editText = "Edit",
  deleteText = "Delete",
  showActions = true
}) => {
  const defaultActions = (
    <>
      {onEdit && (
        <Button
          onClick={onEdit}
          variant="outlined"
          sx={{
            borderColor: '#2196F3',
            color: '#2196F3',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#1976D2',
              backgroundColor: 'rgba(33, 150, 243, 0.04)'
            }
          }}
        >
          {editText}
        </Button>
      )}
      {onDelete && (
        <Button
          onClick={onDelete}
          variant="outlined"
          sx={{
            borderColor: '#f44336',
            color: '#f44336',
            textTransform: 'none',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            '&:hover': {
              borderColor: '#d32f2f',
              backgroundColor: 'rgba(244, 67, 54, 0.04)'
            }
          }}
        >
          {deleteText}
        </Button>
      )}
      <Button
        onClick={onClose}
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
        Close
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
        pb: 8, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <VisibilityIcon sx={{ color: '#2196F3' }} />
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
      
      <DialogContent sx={{ pt: 3, pb: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children}
        </Box>
      </DialogContent>
      
      {showActions && (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, pb: 6, gap: 2 }}>
            {actions || defaultActions}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ViewModal; 