import axios from "axios";
import { useState, useEffect } from "react";
import Comment from "./Comment";
import EditMenu from "./EditMenu.tsx";
import { Box, Button, TextField, Typography, Stack, Chip } from "@mui/material";
const apiUrl = import.meta.env.VITE_API_URL;

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
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch comments when expanded
  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await axios.get(apiUrl + `/threads/${id}/comments`);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(apiUrl + `/threads/${id}/categories`);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
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

  return (
    <Box sx={{ m: 2, backgroundColor: "#ffffff" }}>
      {editMode ? (
        <>
          <TextField
            value={newTitle}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            placeholder="Title"
            fullWidth
          />
          <TextField
            value={newContent}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            multiline
            rows={5}
            style={{ flex: 1 }}
            fullWidth
          />
          <Button onClick={handleUpdate}>Save</Button>
        </>
      ) : (
        <Box>
          <Box
            display="flex"
            sx={{
              height: "40px",
              p: "2px",
              width: "100%",
              overflow: "hidden",
              display: "flex",
              maxWidth: "100%",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: "bold",
              }}
            >
              {newTitle}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ pl: "20px" }}>
              {categories &&
                categories.map((category) => (
                  <Chip label={category} key={category} />
                ))}
            </Stack>
            {userId === currentUser && (
              <EditMenu
                key={"PostMenu" + id}
                handleDelete={handleDelete}
                setEditMode={setEditMode}
              />
            )}
          </Box>
          <Typography>{newContent}</Typography>
        </Box>
      )}

      <Button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide Comments" : "Show Comments"}
      </Button>

      {expanded && (
        <div className="comments-section">
          <Typography>
            <b>Comments</b>
          </Typography>

          {comments &&
            comments.map((comment) => (
              <Comment
                key={"comment" + comment.id}
                id={comment.id}
                content={comment.content}
                userId={comment.userId}
                currentUser={currentUser}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
              />
            ))}
          {currentUser != 0 && (
            <>
              <TextField
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                fullWidth
              />
              <Button onClick={handleAddComment} variant="outlined">
                Add Comment
              </Button>
            </>
          )}
        </div>
      )}
    </Box>
  );
};

export default Post;
