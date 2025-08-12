import * as React from 'react';
import {
  Box,
  Button,
  Typography,
  Modal,
  IconButton,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 3
};

export default function CreateProcedureModal() {
  const [open, setOpen] = React.useState(false);
  const [procedure, setProcedure] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button variant="contained" onClick={handleOpen}>
        Create
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Create procedure
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Input Field */}
          <TextField
            fullWidth
            label="Procedure*"
            variant="outlined"
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                console.log('Creating:', procedure);
                handleClose();
              }}
              sx={{
                textTransform: 'none',
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
