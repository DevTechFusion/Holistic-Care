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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { getUsers } from "../../DAL/users";

const PharmacyFilterPopover = ({
  anchorEl,
  open,
  onClose,
  filters,
  setFilters,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Fetch agents when typing
  useEffect(() => {
    if (agentSearch === "" && agents.length > 0) return; // ✅ avoid refetch when clearing input
    const timeout = setTimeout(() => fetchAgents(agentSearch), 400);
    return () => clearTimeout(timeout);
  }, [agentSearch]);

  const fetchAgents = async (query = "") => {
    try {
      setLoadingAgents(true);
      const res = await getUsers(1, 50, "agent", query); // Pass query if API supports it
      setAgents(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch agents", err);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
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
          <TextField
            label="Search (name/phone)"
            value={localFilters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            fullWidth
          />

          <TextField
  label="Status"
  select
  SelectProps={{ native: true }}
  value={localFilters.status}
  onChange={(e) => handleChange("status", e.target.value)}
  fullWidth
>
  {/* Placeholder option */}
  <option value="" disabled hidden>
    Select Status
  </option>

  <option value="pending">Pending</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
</TextField>


          {/* ✅ Agent Autocomplete with live search */}
          <Autocomplete
            options={agents}
            loading={loadingAgents}
            getOptionLabel={(option) => option.name || ""}
            value={agents.find((a) => a.id === localFilters.agent_id) || null}
            onChange={(e, value) => handleChange("agent_id", value?.id)}
            onInputChange={(e, newInputValue) => setAgentSearch(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Agent"
                placeholder="Type to search agent..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingAgents ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
            filterOptions={(x) => x}
          />

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
