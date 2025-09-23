import { useEffect, useState } from "react";
import {
  Popover,
  Box,
  Typography,
  Divider,
  Stack,
  TextField,
  Autocomplete,
  MenuItem,
  Button,
} from "@mui/material";
import { getDoctors } from "../../DAL/doctors";
import { getProcedures } from "../../DAL/procedure";
import { getAllDepartments } from "../../DAL/departments";
import { getUsers } from "../../DAL/users";

const FilterPopover = ({ anchorEl, open, onClose, filters, setFilters }) => {
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [docRes, agentRes, deptRes, procRes] = await Promise.all([
      getDoctors(),
      getUsers(1, 100, "agent"),
      getAllDepartments(),
      getProcedures(),
    ]);
    setDoctors(docRes?.data?.data || []);
    setAgents(agentRes?.data?.data || []);
    setDepartments(deptRes?.data?.data || []);
    setProcedures(procRes?.data?.data || []);
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
      order_by: "created_at",
      order_direction: "desc",
    };
    setLocalFilters(cleared);
    setFilters(cleared);
    onClose();
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
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
          Filter Appointments
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
            renderInput={(params) => <TextField {...params} label="Doctor" placeholder="Select Doctor" />}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />
          <Autocomplete
            options={agents}
            getOptionLabel={(option) => option.name || ""}
            value={agents.find((a) => a.id === localFilters.agent_id) || null}
            onChange={(e, value) => handleChange("agent_id", value?.id)}
            renderInput={(params) => <TextField {...params} label="Agent" placeholder="Select Agent" />}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />
          <TextField
            select
            label="Department"
            value={localFilters.department_id}
            onChange={(e) => handleChange("department_id", e.target.value)}
            fullWidth
          >
            <MenuItem value="">All Departments</MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            options={procedures}
            getOptionLabel={(option) => option.name || ""}
            value={procedures.find((p) => p.id === localFilters.procedure_id) || null}
            onChange={(e, value) => handleChange("procedure_id", value?.id)}
            renderInput={(params) => <TextField {...params} label="Procedure" placeholder="Select Procedure" />}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button variant="outlined" color="error" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="contained" color="primary" onClick={handleApply}>
            Apply
          </Button>
        </Stack>
      </Stack>
    </Popover>
  );
};

export default FilterPopover;
