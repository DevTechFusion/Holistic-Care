import { useEffect, useState } from "react";
import {
  Popover,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { getSelectRoles } from "../../DAL/roles";

const UsersFilterPopover = ({ anchorEl, open, onClose, filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters || { role_id: "" });
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    setLocalFilters(filters || { role_id: "" });
  }, [filters]);

  useEffect(() => {
    if (open && roles.length === 0) {
      fetchRoles();
    }
  }, [open]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const res = await getSelectRoles();
      const items = res?.data?.data ?? res?.data ?? [];
      setRoles(items);
    } catch (err) {
      console.error("Failed to fetch roles", err);
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value ?? "" }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = { role_id: "" };
    setLocalFilters(cleared);
    setFilters(cleared);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      PaperProps={{ sx: { width: 320, p: 3, borderRadius: 2 } }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Filter by Role
        </Typography>

        <Divider />

        <Autocomplete
          options={roles}
          loading={loadingRoles}
          getOptionLabel={(option) => option.name || option.display_name || ""}
          value={roles.find((r) => r.id === localFilters.role_id) || null}
          onChange={(e, value) => handleChange("role_id", value?.id)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Role"
              placeholder="Select role"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingRoles ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          isOptionEqualToValue={(o, v) => o?.id === v?.id}
          fullWidth
          filterOptions={(x) => x}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}>
          <Button onClick={handleClear} variant="outlined" color="error">
            Clear
          </Button>
          <Button onClick={handleApply} variant="contained">
            Apply
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
};

export default UsersFilterPopover;