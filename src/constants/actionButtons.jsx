// src/constants/actionButtons.jsx
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ActionButtons = ({ onEdit, onDelete }) => {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <Tooltip title="Edit">
        <IconButton color="primary" size="small" onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          color="error"
          size="small"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this item?")) {
              onDelete();
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default ActionButtons;
