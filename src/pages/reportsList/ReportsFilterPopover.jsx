import { useEffect, useState } from "react";
import {
  Popover,
  Typography,
  Divider,
  Stack,
  TextField,
  Autocomplete,
  MenuItem,
  Button,
} from "@mui/material";
import { getDoctorsList } from "../../DAL/doctors";
import { getProceduresList } from "../../DAL/procedure";
import { getDepartmentsList } from "../../DAL/departments";
import { getAgentList } from "../../DAL/users";
import { getSelectStatuses } from "../../DAL/status";
import { getSelectRemarks1 } from "../../DAL/remarks1";
import { getSelectRemarks2 } from "../../DAL/remarks2";

const paymentModes = [
  { id: "not_paid", name: "Not Paid" },

];

const ReportsFilterPopover = ({ anchorEl, open, onClose, filters, setFilters }) => {
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [remarks1, setRemarks1] = useState([]);
  const [remarks2, setRemarks2] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const fetchData = async () => {
    try {
      const [docRes, agentRes, deptRes, procRes, statusRes, remarks1Res, remarks2Res] = await Promise.all([
        getDoctorsList(),
        getAgentList(),
        getDepartmentsList(),
        getProceduresList(),
        getSelectStatuses(),
        getSelectRemarks1(),
        getSelectRemarks2(),
      ]);

      setDoctors(Array.isArray(docRes?.data) ? docRes.data : []);
      setAgents(Array.isArray(agentRes?.data) ? agentRes.data : []);
      setDepartments(Array.isArray(deptRes?.data) ? deptRes.data : []);
      setProcedures(Array.isArray(procRes?.data) ? procRes.data : []);
      setStatuses(
      Array.isArray(statusRes?.data)
        ? statusRes.data.map((s) => ({ id: s.value, name: s.label }))
        : []
      );
      setRemarks1(
      Array.isArray(remarks1Res?.data)
        ? remarks1Res.data.map((r) => ({ id: r.value, name: r.label }))
        : []
    );
    setRemarks2(
      Array.isArray(remarks2Res?.data)
        ? remarks2Res.data.map((r) => ({ id: r.value, name: r.label }))
        : []
    );
    } catch (error) {
      console.error("Error fetching filter data:", error);
      setDoctors([]);
      setAgents([]);
      setDepartments([]);
      setProcedures([]);
      setStatuses([]);
      setRemarks1([]);
      setRemarks2([]);
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
      start_date: "",
      end_date: "",
      doctor_id: "",
      agent_id: "",
      department_id: "",
      procedure_id: "",
      status: "",
      remarks_1_id: "",
      remarks_2_id: "",
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
      anchorEl={anchorEl}
      open={open}
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
          {/* Date Filters */}
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

          {/* Doctor Dropdown */}
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

          {/* Agent Dropdown */}
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

          {/* Department Dropdown */}
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

          {/* Procedure Dropdown */}
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

          {/* Status Dropdown */}
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
          />

          { /* Remarks */}
          <Autocomplete
            options={remarks1}
            getOptionLabel={(option) => option.name || ""}
            value={remarks1.find((r) => r.id === localFilters.remarks_1_id) || null}
            onChange={(e, value) => handleChange("remarks_1_id", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Remark 1"
                placeholder="Select Remark 1"
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />

          { /* Remarks */}
          <Autocomplete
            options={remarks2}
            getOptionLabel={(option) => option.name || ""}
            value={remarks2.find((r) => r.id === localFilters.remarks_2_id) || null}
            onChange={(e, value) => handleChange("remarks_2_id", value?.id)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Remark 2"
                placeholder="Select Remark 2"
              />
            )}
            isOptionEqualToValue={(o, v) => o.id === v.id}
          />

          {/* Payment Mode Dropdown */}
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

        {/* Buttons */}
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

export default ReportsFilterPopover;
