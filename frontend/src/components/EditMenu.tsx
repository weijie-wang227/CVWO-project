import { useState, Dispatch, SetStateAction } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVert } from "@mui/icons-material";

interface MenuProp {
  handleDelete: () => void;
  setEditMode: Dispatch<SetStateAction<boolean>>;
}
const EditMenu = ({ handleDelete, setEditMode }: MenuProp) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuExpanded = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVert />
      </IconButton>
      <Menu
        open={menuExpanded}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem key={"edit"} onClick={() => setEditMode(true)}>
          Edit
        </MenuItem>
        <MenuItem key={"delete"} onClick={handleDelete}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default EditMenu;
