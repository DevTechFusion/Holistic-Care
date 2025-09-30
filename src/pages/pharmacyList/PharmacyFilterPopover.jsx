import { useEffect, useState } from "react";
import {
  Popover,
  Button,
  TextField,
  Typography,
  Stack,
  Divider,
  Autocomplete,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getAgentList } from "../../DAL/users";
import { getSelectStatuses } from "../../DAL/status";

const PharmacyFilterPopover = ({ anchorEl, open, onClose, filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [agents, setAgents] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (open) {
      fetchAgents();
      fetchStatuses();
    }
  }, [open]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await getAgentList(); 
      setAgents(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchStatuses = async () => {
    setLoadingStatuses(true);
    try {
      const res = await getSelectStatuses();
      setStatuses(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch statuses:", err);
      setStatuses([]);
    } finally {
      setLoadingStatuses(false);
    }
  };

  const handleChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value || "" }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {
      search: "",
      status: "",
      agent_id: "",
      start_date: "",
      end_date: "",
    };
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
      PaperProps={{
        sx: {
          width: 320,
          maxHeight: 500,
          p: 3,
          borderRadius: 2,
          overflowY: "auto",
        },
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Filter Pharmacies
        </Typography>

        <Divider />

        <Stack spacing={2}>
          {/* Search Field */}
          <TextField
            label="Search (name/phone)"
            value={localFilters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            fullWidth
          />

          {/* Status Dropdown */}
          <TextField
            label="Status"
            select
            value={localFilters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            fullWidth
            disabled={loadingStatuses}
            InputProps={{
              endAdornment: loadingStatuses ? (
                <CircularProgress size={20} sx={{ mr: 2 }} />
              ) : null,
            }}
          >
            <MenuItem value="">
              <em>Select Status</em>
            </MenuItem>
            {statuses.length > 0 ? (
              statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No statuses available</MenuItem>
            )}
          </TextField>

          {/* Agent Dropdown */}
          <Autocomplete
            options={agents}
            getOptionLabel={(option) => option.name || ""}
            value={agents.find((a) => a.id === localFilters.agent_id) || null}
            onChange={(e, value) => handleChange("agent_id", value?.id)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Agent" 
                placeholder="Select Agent"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAgents ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            loading={loadingAgents}
            disabled={loadingAgents}
            fullWidth
          />

          {/* Date Filters */}
          <DatePicker
            label="Start Date"
            value={localFilters.start_date || null}
            onChange={(val) => handleChange("start_date", val)}
            slotProps={{ textField: { fullWidth: true } }}
          />
          <DatePicker
            label="End Date"
            value={localFilters.end_date || null}
            onChange={(val) => handleChange("end_date", val)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button onClick={handleClear} variant="outlined" color="error">
            Clear
          </Button>
          <Button onClick={handleApply} variant="contained" color="primary">
            Apply
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
};

export default PharmacyFilterPopover;