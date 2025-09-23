import { useEffect, useState } from "react";
import {
  Popover,
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Autocomplete,
  Divider,
  MenuItem,
} from "@mui/material";
import { getDoctors } from "../../DAL/doctors";
import { getProcedures } from "../../DAL/procedure";
import { getAllDepartments } from "../../DAL/departments";
import { getUsers } from "../../DAL/users";
import { getAllStatuses } from "../../DAL/status";

const paymentModes = [
  { id: "cash", name: "Cash" },
  { id: "online", name: "Online" },
  { id: "card", name: "Card" },
];

const ReportsFilterPopover = ({
  anchorEl,
  open,
  onClose,
  filters,
  setFilters,
}) => {
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [docRes, agentRes, deptRes, procRes, statusRes] = await Promise.all([
      getDoctors(),
      getUsers(1, 100, "agent"),
      getAllDepartments(),
      getProcedures(),
      getAllStatuses(),
    ]);
    setDoctors(docRes?.data?.data || []);
    setAgents(agentRes?.data?.data || []);
    setDepartments(deptRes?.data?.data || []);
    setProcedures(procRes?.data?.data || []);
    setStatuses(statusRes?.data?.data || []);
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
      start_date: "",
      end_date: "",
      doctor_id: "",
      agent_id: "",
      department_id: "",
      procedure_id: "",
      status: "",
      payment_mode: "",
      order_by: "created_at",
      order_direction: "desc",
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
          maxHeight: 600,
          p: 3,
          borderRadius: 2,
          overflowY: "auto",
        },
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Filter Reports
        </Typography>

        <Divider />

        <Stack spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            value={localFilters.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="End Date"
            type="date"
            value={localFilters.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <Autocomplete
            options={doctors}
            getOptionLabel={(option) => option.name || ""}
            value={doctors.find((d) => d.id === localFilters.doctor_id) || null}
            onChange={(e, value) => handleChange("doctor_id", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Doctor"
                placeholder="Select Doctor"
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />

          <Autocomplete
            options={agents}
            getOptionLabel={(option) => option.name || ""}
            value={agents.find((a) => a.id === localFilters.agent_id) || null}
            onChange={(e, value) => handleChange("agent_id", value?.id)}
            renderInput={(params) => (
              <TextField {...params} label="Agent" placeholder="Select Agent" />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />

          <Autocomplete
            options={departments}
            getOptionLabel={(option) => option.name || ""}
            value={
              departments.find((d) => d.id === localFilters.department_id) ||
              null
            }
            onChange={(e, value) => handleChange("department_id", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Department"
                placeholder="Select Department"
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />

          <Autocomplete
            options={procedures}
            getOptionLabel={(option) => option.name || ""}
            value={
              procedures.find((p) => p.id === localFilters.procedure_id) || null
            }
            onChange={(e, value) => handleChange("procedure_id", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Procedure"
                placeholder="Select Procedure"
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />

          <Autocomplete
            options={statuses}
            getOptionLabel={(option) => option.name || ""}
            value={statuses.find((s) => s.id === localFilters.status) || null}
            onChange={(e, value) => handleChange("status", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Status"
                placeholder="Select Status"
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />

          <Autocomplete
            options={paymentModes}
            getOptionLabel={(option) => option.name || ""}
            value={
              paymentModes.find((p) => p.id === localFilters.payment_mode) ||
              null
            }
            onChange={(e, value) => handleChange("payment_mode", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Payment Mode"
                placeholder="Select Payment Mode"
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
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

export default ReportsFilterPopover;
