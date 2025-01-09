import axios from "axios";
import { useState, useEffect } from "react";
import Comment from "./Comment";
import { IconButton, Button, TextField } from "@mui/material";
import { MoreVert } from "@mui/icons-material";

interface CommentData {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
}

interface PostProps {
  id: number;
  oldTitle: string;
  oldContent: string;
  userId: number;
  currentUser: number;
  onDelete: () => void;
}

const Post = ({
  id,
  oldTitle,
  oldContent,
  userId,
  currentUser,
  onDelete,
}: PostProps) => {
  const [newTitle, setTitle] = useState(oldTitle);
  const [newContent, setContent] = useState(oldContent);
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [menuExpanded, setMenu] = useState(false);

  // Fetch comments when expanded
  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded]);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/threads/${id}/comments`
      );
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`http://localhost:8080/threads/${id}/comments`, {
        content: newComment,
        userId: currentUser,
      });

      fetchComments();
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // Handle updating post
  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:8080/threads/${id}`, {
        title: newTitle,
        content: newContent,
        userId,
      });
      setEditMode(false);
      fetchComments();
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  // Handle deleting the post
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/threads/${id}`);
      onDelete(); // Remove post
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  // Handle comment update
  const handleUpdateComment = (commentId: number, updatedContent: string) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, content: updatedContent }
          : comment
      )
    );
  };

  // Handle comment delete
  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  //Expand edit menu
  const toggleMenu = () => {
    setMenu(!menuExpanded);
  };

  return (
    <div className="post">
      {editMode ? (
        <>
          <input value={newTitle} onChange={(e) => setTitle(e.target.value)} />
          <textarea
            value={newContent}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={handleUpdate}>Save</Button>
        </>
      ) : (
        <>
          <h2>{newTitle}</h2>
          <p>{newContent}</p>
          {userId === currentUser && (
            <>
              <IconButton onClick={toggleMenu}>
                <MoreVert />
              </IconButton>
              {menuExpanded && (
                <>
                  <button onClick={() => setEditMode(true)}>Edit</button>
                  <button onClick={handleDelete}>Delete</button>
                </>
              )}
            </>
          )}
        </>
      )}

      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide Comments" : "Show Comments"}
      </Button>

      {expanded && (
        <div className="comments-section">
          <h3>Comments</h3>
          {comments &&
            comments.map((comment) => (
              <Comment
                key={comment.id}
                id={comment.id}
                content={comment.content}
                userId={comment.userId}
                currentUser={currentUser}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
              />
            ))}

          <TextField
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <Button onClick={handleAddComment} variant="outlined">
            Add Comment
          </Button>
        </div>
      )}
    </div>
  );
};

export default Post;
