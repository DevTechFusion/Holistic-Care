// src/constants/actionButtons.jsx
import { IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const ActionButtons = ({ onEdit, onDelete, onAdd }) => {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {onEdit && (
        <Tooltip title="Edit">
          <IconButton color="primary" size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title="Delete">
          <IconButton
            color="error"
            size="small"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this item?")
              ) {
                onDelete();
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {onAdd && (
        <Tooltip title="Add Complaint">
          <IconButton color="darkblack" size="small" onClick={onAdd}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons;
