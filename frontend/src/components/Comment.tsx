import axios from "axios";
import { useState } from "react";
import EditMenu from "./EditMenu";
import { TextField, Button, Typography, Box } from "@mui/material";
const apiUrl = import.meta.env.VITE_API_URL;

interface CommentProps {
  id: number;
  content: string;
  userId: number;
  currentUser: number;
  onDelete: (id: number) => void;
  onUpdate: (id: number, content: string) => void;
}

const Comment = ({
  id,
  content,
  userId,
  currentUser,
  onDelete,
  onUpdate,
}: CommentProps) => {
  const [editMode, setEditMode] = useState(false);
  const [newContent, setNewContent] = useState(content);

  // Handle updating a comment
  const handleUpdate = async () => {
    try {
      await axios.put(apiUrl + `/comments/${id}`, {
        content: newContent,
        userId: currentUser,
      });
      onUpdate(id, newContent); // Update locally
      setEditMode(false); // Exit edit mode
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  // Handle deleting a comment
  const handleDelete = async () => {
    try {
      await axios.delete(apiUrl + `/comments/${id}`);
      onDelete(id); // Remove from parent component
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center" // Vertically aligns items
      sx={{ height: "30px" }}
    >
      {editMode ? (
        <>
          <TextField
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <Button onClick={handleUpdate}>Save</Button>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
        </>
      ) : (
        <>
          <Typography>{content}</Typography>
          {userId === currentUser && (
            <EditMenu handleDelete={handleDelete} setEditMode={setEditMode} />
          )}
        </>
      )}
    </Box>
  );
};

export default Comment;
