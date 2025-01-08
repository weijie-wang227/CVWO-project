import axios from "axios";
import { useState } from "react";

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
      await axios.put(`http://localhost:8080/comments/${id}`, {
        content: newContent,
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
      await axios.delete(`http://localhost:8080/comments/${id}`);
      onDelete(id); // Remove from parent component
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  return (
    <div className="comment">
      {editMode ? (
        <>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </>
      ) : (
        <>
          <p>{content}</p>
          {userId === currentUser && (
            <>
              <button onClick={() => setEditMode(true)}>Edit</button>
              <button onClick={handleDelete}>Delete</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Comment;
