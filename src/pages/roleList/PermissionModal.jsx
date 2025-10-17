import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Stack,
  Chip,
  Paper,
  alpha,
} from "@mui/material";
import { getPermissions, assignPermission, removePermission } from "../../DAL/permission";
import { useSnackbar } from "notistack";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';

const PermissionModal = ({ open, onClose, role }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [permissions, setPermissions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selected, setSelected] = useState([]);
  const [initialSelected, setInitialSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch permissions and initialize selected state
  useEffect(() => {
    if (open && role) {
      setLoading(true);
      getPermissions()
        .then((res) => {
          const perms = res?.data || [];
          setPermissions(perms);
          
          // Group by module
          const groupedObj = {};
          perms.forEach((perm) => {
            if (!groupedObj[perm.module]) groupedObj[perm.module] = [];
            groupedObj[perm.module].push(perm);
          });
          setGrouped(groupedObj);

          // Initialize selected permissions from role
          const rolePermissions = role?.permissions || [];
          const initialPerms = rolePermissions.map(p => ({
            name: p.name,
            module: p.module
          }));
          setSelected(initialPerms);
          setInitialSelected(initialPerms);
        })
        .catch((err) => {
          console.error("Failed to fetch permissions", err);
          setPermissions([]);
          enqueueSnackbar("Failed to load permissions", { variant: "error" });
        })
        .finally(() => setLoading(false));
    }
  }, [open, role, enqueueSnackbar]);

  // Check if a permission is selected
  const isSelected = (perm) => {
    return selected.some(
      (p) => p.name === perm.name && p.module === perm.module
    );
  };

  // Handle checkbox toggle
  const handleToggle = (perm) => {
    const exists = selected.find(
      (p) => p.name === perm.name && p.module === perm.module
    );
    
    if (exists) {
      // Remove permission
      setSelected(selected.filter(
        (p) => !(p.name === perm.name && p.module === perm.module)
      ));
    } else {
      // Add permission
      setSelected([...selected, { name: perm.name, module: perm.module }]);
    }
  };

  // Select all permissions in a module
  const handleSelectAllModule = (module) => {
    const modulePerms = grouped[module] || [];
    const allSelected = modulePerms.every(perm => isSelected(perm));
    
    if (allSelected) {
      // Deselect all in this module
      setSelected(selected.filter(
        (p) => p.module !== module
      ));
    } else {
      // Select all in this module
      const newPerms = modulePerms.map(perm => ({
        name: perm.name,
        module: perm.module
      }));
      
      // Remove existing permissions from this module and add all
      const filtered = selected.filter(p => p.module !== module);
      setSelected([...filtered, ...newPerms]);
    }
  };

  // Check if all permissions in a module are selected
  const isModuleFullySelected = (module) => {
    const modulePerms = grouped[module] || [];
    return modulePerms.length > 0 && modulePerms.every(perm => isSelected(perm));
  };

  // Check if some (but not all) permissions in a module are selected
  const isModulePartiallySelected = (module) => {
    const modulePerms = grouped[module] || [];
    const selectedCount = modulePerms.filter(perm => isSelected(perm)).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  };

  // Calculate changes from initial state
  const changes = useMemo(() => {
    const toAdd = selected.filter(
      (sel) =>
        !initialSelected.some(
          (init) => init.name === sel.name && init.module === sel.module
        )
    );

    const toRemove = initialSelected.filter(
      (init) =>
        !selected.some(
          (sel) => sel.name === init.name && sel.module === init.module
        )
    );

    return { toAdd, toRemove };
  }, [selected, initialSelected]);

  // Check if there are any changes
  const hasChanges = changes.toAdd.length > 0 || changes.toRemove.length > 0;

  // Submit permissions changes
  const handleSubmit = async () => {
    if (!hasChanges) {
      enqueueSnackbar("No changes to save", { variant: "info" });
      onClose();
      return;
    }

    setSubmitting(true);
    const errors = [];

    try {
      // Assign new permissions
      if (changes.toAdd.length > 0) {
        const assignPayload = { permissions: changes.toAdd };
        const assignRes = await assignPermission(assignPayload, role.id);
        
        if (assignRes?.code && assignRes.code !== 200 && assignRes.code !== 201) {
          errors.push(`Failed to assign permissions: ${assignRes.message || 'Unknown error'}`);
        }
      }

      // Remove unchecked permissions
      if (changes.toRemove.length > 0) {
        const removePayload = { permissions: changes.toRemove };
        const removeRes = await removePermission(removePayload, role.id);
        
        if (removeRes?.code && removeRes.code !== 200 && removeRes.code !== 201) {
          errors.push(`Failed to remove permissions: ${removeRes.message || 'Unknown error'}`);
        }
      }

      // Show results
      if (errors.length > 0) {
        enqueueSnackbar(errors.join('. '), { variant: "error" });
      } else {
        const addedCount = changes.toAdd.length;
        const removedCount = changes.toRemove.length;
        let message = "Permissions updated successfully!";
        
        if (addedCount > 0 && removedCount > 0) {
          message = `Added ${addedCount} and removed ${removedCount} permissions`;
        } else if (addedCount > 0) {
          message = `Added ${addedCount} permission(s)`;
        } else if (removedCount > 0) {
          message = `Removed ${removedCount} permission(s)`;
        }
        
        enqueueSnackbar(message, { variant: "success" });
        onClose();
      }
    } catch (err) {
      console.error("Error updating permissions:", err);
      enqueueSnackbar(
        "Network error. Please check your connection and try again.",
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel - reset to initial state
  const handleCancel = () => {
    setSelected(initialSelected);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
        }
      }}
    >
      <DialogTitle sx={{ pb: 2, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Manage Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary" >
              Configure access permissions for <strong>{role?.name}</strong> role
            </Typography>
          </Box>
          {hasChanges && (
            <Chip
              label={`${changes.toAdd.length} to add • ${changes.toRemove.length} to remove`}
              color="primary"
              size="small"
              sx={{ 
                fontWeight: 600,
                px: 2,
              }}
            />
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress size={48} />
              <Typography color="text.secondary">Loading permissions...</Typography>
            </Stack>
          </Box>
        ) : permissions.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No permissions available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no permissions to assign at this time
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {Object.keys(grouped).sort().map((module, idx) => {
              const moduleSelectedCount = grouped[module].filter(p => isSelected(p)).length;
              const moduleTotalCount = grouped[module].length;
              const isFullySelected = isModuleFullySelected(module);
              const isPartiallySelected = isModulePartiallySelected(module);
              
              return (
                <Paper 
                  key={module}
                  elevation={0}
                  sx={{ 
                    border: 1, 
                    borderColor: isFullySelected 
                      ? 'primary.main' 
                      : isPartiallySelected 
                        ? alpha('#1976d2', 0.3)
                        : 'divider',
                    borderRadius: 2,
                    p: 2.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: `0 0 0 1px ${alpha('#1976d2', 0.1)}`,
                    }
                  }}
                >
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    mb={2}
                    sx={{ 
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onClick={() => handleSelectAllModule(module)}
                  >
                    <Checkbox
                      checked={isFullySelected}
                      indeterminate={isPartiallySelected}
                      onChange={() => handleSelectAllModule(module)}
                      icon={<RadioButtonUncheckedIcon />}
                      checkedIcon={<CheckCircleIcon />}
                      indeterminateIcon={<IndeterminateCheckBoxIcon />}
                      sx={{ 
                        padding: 0, 
                        mr: 1.5,
                        '& .MuiSvgIcon-root': { fontSize: 28 }
                      }}
                    />
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      sx={{ 
                        flex: 1,
                        color: isFullySelected ? 'primary.main' : 'text.primary'
                      }}
                    >
                      {module}
                    </Typography>
                    <Chip
                      label={`${moduleSelectedCount}/${moduleTotalCount}`}
                      size="small"
                      color={isFullySelected ? 'primary' : 'default'}
                      variant={isFullySelected ? 'filled' : 'outlined'}
                      sx={{ 
                        fontWeight: 600,
                        minWidth: 50,
                      }}
                    />
                  </Box>
                  
                  <Box 
                    sx={{ 
                      pl: 5,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: 1.5,
                    }}
                  >
                    {grouped[module].map((perm) => {
                      const isChecked = isSelected(perm);
                      return (
                        <FormControlLabel
                          key={perm.id}
                          control={
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleToggle(perm)}
                              size="small"
                              sx={{
                                '&.Mui-checked': {
                                  color: 'primary.main',
                                }
                              }}
                            />
                          }
                          label={
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontWeight: isChecked ? 500 : 400,
                                color: isChecked ? 'text.primary' : 'text.secondary'
                              }}
                            >
                              {perm.display_name}
                            </Typography>
                          }
                          sx={{
                            m: 0,
                            py: 0.5,
                            px: 1.5,
                            borderRadius: 1,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              backgroundColor: alpha('#1976d2', 0.04),
                            }
                          }}
                        />
                      );
                    })}
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2.5, borderTop: 1, borderColor: 'divider', gap: 1.5 }}>
        <Button 
          onClick={handleCancel} 
          disabled={submitting}
          variant="outlined"
          size="large"
          sx={{ 
            minWidth: 100,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={submitting || !hasChanges}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ 
            minWidth: 140,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermissionModal;