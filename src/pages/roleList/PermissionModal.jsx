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
  TextField,
  InputAdornment,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import { getPermissions, assignPermission, removePermission, getAssignedPermissions } from "../../DAL/permission";
import { useSnackbar } from "notistack";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockIcon from '@mui/icons-material/Lock';

const PermissionModal = ({ open, onClose, role }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [permissions, setPermissions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selected, setSelected] = useState([]);
  const [initialSelected, setInitialSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && role) {
      setLoading(true);
      
      Promise.all([
        getPermissions(),
        getAssignedPermissions(role.id)
      ])
        .then(([allPermsRes, assignedPermsRes]) => {
          // Process all available permissions
          const perms = allPermsRes?.data || [];
          setPermissions(perms);
          
          // Group permissions by module
          const groupedObj = {};
          perms.forEach((perm) => {
            if (!groupedObj[perm.module]) groupedObj[perm.module] = [];
            groupedObj[perm.module].push(perm);
          });
          setGrouped(groupedObj);
          
          // Extract assigned permissions from API response
          const assignedPerms = assignedPermsRes?.data || [];
          const initialPerms = assignedPerms.map(p => ({
            name: p.name,
            module: p.module
          }));
          
          setSelected(initialPerms);
          setInitialSelected(initialPerms);
        })
        .catch((err) => {
          console.error("Failed to fetch permissions", err);
          enqueueSnackbar("Failed to load permissions", { variant: "error" });
        })
        .finally(() => setLoading(false));
    }
  }, [open, role, enqueueSnackbar]);

  const isSelected = (perm) => {
    return selected.some(p => p.name === perm.name && p.module === perm.module);
  };

  const findViewPermission = (module) => {
    return permissions.find(p => 
      p.module === module && /view/i.test(p.name)
    );
  };

  const isViewPermission = (perm) => {
    return /view/i.test(perm.name);
  };

  const handleToggle = (perm) => {
    const exists = isSelected(perm);
    
    if (exists) {
      // If unchecking, check if it's a view permission
      if (isViewPermission(perm)) {
        // Check if there are other non-view permissions in this module
        const hasOtherPerms = selected.some(p => 
          p.module === perm.module && !isViewPermission(p)
        );
        
        if (hasOtherPerms) {
          enqueueSnackbar(
            `Cannot remove View permission while other permissions exist in ${perm.module}. Remove other permissions first.`,
            { variant: "warning", autoHideDuration: 4000 }
          );
          return;
        }
      }
      
      setSelected(selected.filter(p => 
        !(p.name === perm.name && p.module === perm.module)
      ));
    } else {
      // If checking a non-view permission, auto-check view permission
      const newSelected = [...selected, { name: perm.name, module: perm.module }];
      
      if (!isViewPermission(perm)) {
        const viewPerm = findViewPermission(perm.module);
        const viewAlreadySelected = selected.some(p => 
          p.module === perm.module && isViewPermission(p)
        );
        
        if (viewPerm && !viewAlreadySelected) {
          newSelected.push({ name: viewPerm.name, module: viewPerm.module });
          enqueueSnackbar(
            `View permission automatically added for ${perm.module}`,
            { variant: "info", autoHideDuration: 2000 }
          );
        }
      }
      
      setSelected(newSelected);
    }
  };

  const handleSelectAllModule = (module) => {
    const modulePerms = grouped[module] || [];
    const allSelected = modulePerms.every(perm => isSelected(perm));
    
    if (allSelected) {
      setSelected(selected.filter(p => p.module !== module));
    } else {
      const newPerms = modulePerms.map(perm => ({
        name: perm.name,
        module: perm.module
      }));
      
      const filtered = selected.filter(p => p.module !== module);
      setSelected([...filtered, ...newPerms]);
    }
  };

  const isModuleFullySelected = (module) => {
    const modulePerms = grouped[module] || [];
    return modulePerms.length > 0 && modulePerms.every(perm => isSelected(perm));
  };

  const isModulePartiallySelected = (module) => {
    const modulePerms = grouped[module] || [];
    const selectedCount = modulePerms.filter(perm => isSelected(perm)).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  };

  const filteredGrouped = useMemo(() => {
    if (!searchQuery.trim()) return grouped;
    
    const query = searchQuery.toLowerCase();
    const filtered = {};
    
    Object.keys(grouped).forEach(module => {
      const moduleMatches = module.toLowerCase().includes(query);
      const matchingPerms = grouped[module].filter(perm => 
        moduleMatches || 
        perm.display_name?.toLowerCase().includes(query) ||
        perm.name?.toLowerCase().includes(query)
      );
      
      if (matchingPerms.length > 0) {
        filtered[module] = matchingPerms;
      }
    });
    
    return filtered;
  }, [grouped, searchQuery]);

  const changes = useMemo(() => {
    const toAdd = selected.filter(sel =>
      !initialSelected.some(init => 
        init.name === sel.name && init.module === sel.module
      )
    );

    const toRemove = initialSelected.filter(init =>
      !selected.some(sel => 
        sel.name === init.name && sel.module === init.module
      )
    );

    return { toAdd, toRemove };
  }, [selected, initialSelected]);

  const hasChanges = changes.toAdd.length > 0 || changes.toRemove.length > 0;

  // determine if a module should be considered a dashboard module
  const isDashboardModule = (moduleName) => {
    if (!moduleName) return false;
    return String(moduleName).toLowerCase().includes("dashboard");
  };

  const handleSubmit = async () => {
    if (!hasChanges) {
      enqueueSnackbar("No changes to save", { variant: "info" });
      onClose();
      return;
    }

    // Validate exactly one dashboard module is assigned (unique modules)
    const dashboardModules = Array.from(new Set(
      selected
        .map(s => s.module)
        .filter(m => isDashboardModule(m))
    ));
    if (dashboardModules.length === 0) {
      enqueueSnackbar(
        "At least one dashboard module must be assigned to this role.",
        { variant: "error", autoHideDuration: 4000 }
      );
      return;
    }
    if (dashboardModules.length > 1) {
      enqueueSnackbar(
        `Only one dashboard module allowed. Currently selected: ${dashboardModules.join(', ')}`,
        { variant: "error", autoHideDuration: 4000 }
      );
      return;
    }

    setSubmitting(true);

    try {
      // Prepare assign list and ensure view permissions are included for any added action perms
      let assignList = [...changes.toAdd.map(p => ({ name: p.name, module: p.module }))];

      const actionRegex = /\b(create|edit|update|delete|remove)\b/i;
      const finalSelection = selected; // final selected after user's changes

      for (const p of changes.toAdd) {
        if (actionRegex.test(p.name || "")) {
          const hasViewInFinal = finalSelection.some(sel => sel.module === p.module && /view/i.test(sel.name));
          const hasViewInAssign = assignList.some(a => a.module === p.module && /view/i.test(a.name));
          if (!hasViewInFinal && !hasViewInAssign) {
            const viewPerm = findViewPermission(p.module);
            if (viewPerm) {
              assignList.push({ name: viewPerm.name, module: viewPerm.module });
            } else {
              // fallback: construct a plausible view permission name
              assignList.push({ name: `view_${String(p.module).toLowerCase()}`, module: p.module });
            }
          }
        }
      }

      // Deduplicate assignList
      const dedupMap = {};
      assignList = assignList.filter(item => {
        const key = `${String(item.name)}|${String(item.module)}`;
        if (dedupMap[key]) return false;
        dedupMap[key] = true;
        return true;
      });

      if (assignList.length > 0) {
        const assignRes = await assignPermission({ permissions: assignList }, role.id);
        if (assignRes?.code && assignRes.code !== 200 && assignRes.code !== 201) {
          throw new Error(assignRes.message || 'Failed to assign permissions');
        }
      }

      // Handle removals: prevent removing a view permission if final selection still contains action perms for same module
      if (changes.toRemove.length > 0) {
        const toRemoveFiltered = [];
        for (const rem of changes.toRemove) {
          if (/view/i.test(rem.name || "")) {
            const willHaveActions = finalSelection.some(sel => sel.module === rem.module && actionRegex.test(sel.name));
            if (willHaveActions) {
              enqueueSnackbar(`Cannot remove view permission from module "${rem.module}" while action permissions will remain.`, { variant: "warning" });
              continue;
            }
          }
          toRemoveFiltered.push(rem);
        }

        if (toRemoveFiltered.length > 0) {
          const removeRes = await removePermission({ permissions: toRemoveFiltered }, role.id);
          if (removeRes?.code && removeRes.code !== 200 && removeRes.code !== 201) {
            throw new Error(removeRes.message || 'Failed to remove permissions');
          }
        }
      }

      const addedCount = assignList.length;
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
    } catch (err) {
      console.error("Error updating permissions:", err);
      enqueueSnackbar(
        err.message || "Failed to update permissions",
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelected(initialSelected);
    setSearchQuery("");
    onClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const isViewPermissionRequired = (perm) => {
    if (!isViewPermission(perm)) return false;
    return selected.some(p => p.module === perm.module && !isViewPermission(p));
  };

  const totalSelected = selected.length;
  const totalAvailable = permissions.length;

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
      <DialogTitle sx={{ pb: 0 }}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={2} >
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Manage Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure access permissions for <strong>{role?.name}</strong> role
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {hasChanges && (
                <Chip
                  label={`${changes.toAdd.length} to add • ${changes.toRemove.length} to remove`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
              <Chip
                label={`${totalSelected}/${totalAvailable} selected`}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Stack>
          </Box>
          
          {/* Search Bar */}
          <TextField
            width= "100%"
            size="small"
            placeholder="Search modules or permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
                mb: 2,
                borderBottom: '1px solid #e0e0e0',
              }
            }}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 2 }}>
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
        ) : Object.keys(filteredGrouped).length === 0 ? (
          <Box textAlign="center" py={6}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No results found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Try adjusting your search query
            </Typography>
            <Button 
              onClick={handleClearSearch} 
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Clear search
            </Button>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {searchQuery && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Found {Object.keys(filteredGrouped).length} module(s) matching "{searchQuery}"
                </Typography>
                <Divider sx={{ mt: 1 }} />
              </Box>
            )}
            {Object.keys(filteredGrouped).sort().map((module) => {
              const modulePerms = filteredGrouped[module];
              const moduleSelectedCount = modulePerms.filter(p => isSelected(p)).length;
              const moduleTotalCount = modulePerms.length;
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
                    sx={{ cursor: 'pointer', userSelect: 'none' }}
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
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600}
                        sx={{ 
                          color: isFullySelected ? 'primary.main' : 'text.primary',
                          mb: 0.5
                        }}
                      >
                        {module}
                      </Typography>
                      {isDashboardModule(module) && (
                        <Chip
                          icon={<InfoOutlinedIcon sx={{ fontSize: 14 }} />}
                          label="Dashboard Module"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    <Chip
                      label={`${moduleSelectedCount}/${moduleTotalCount}`}
                      size="small"
                      color={isFullySelected ? 'primary' : 'default'}
                      variant={isFullySelected ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, minWidth: 50 }}
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
                    {modulePerms.map((perm) => {
                      const isChecked = isSelected(perm);
                      const isRequired = isViewPermissionRequired(perm);
                      const permLabel = (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography 
                            variant="body2"
                            sx={{ 
                              fontWeight: isChecked ? 500 : 400,
                              color: isChecked ? 'text.primary' : 'text.secondary'
                            }}
                          >
                            {perm.display_name}
                          </Typography>
                          {isRequired && (
                            <Tooltip title="Required by other permissions" arrow>
                              <LockIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                            </Tooltip>
                          )}
                        </Box>
                      );
                      
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
                          label={permLabel}
                          sx={{
                            m: 0,
                            py: 0.5,
                            px: 1.5,
                            borderRadius: 1,
                            transition: 'all 0.15s ease',
                            border: isRequired ? `1px solid ${alpha('#ed6c02', 0.3)}` : '1px solid transparent',
                            backgroundColor: isRequired ? alpha('#ed6c02', 0.05) : 'transparent',
                            '&:hover': {
                              backgroundColor: isRequired ? alpha('#ed6c02', 0.1) : alpha('#1976d2', 0.04),
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