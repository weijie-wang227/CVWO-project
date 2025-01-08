import axios from "axios";
import { useState, useEffect } from "react";

interface Comment {
  id: number;
  content: string;
  userId: number;
  createdAt: string;
}

interface PostProps {
  id: number;
  title: string;
  content: string;
  userId: number;
  currentUser: number;
}

const Post = ({ id, title, content, userId, currentUser }: PostProps) => {
  // State variables
  const [newTitle, setTitle] = useState(title);
  const [newContent, setContent] = useState(content);
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(false); // Controls expand/collapse
  const [comments, setComments] = useState<Comment[]>([]); // Stores comments
  const [newComment, setNewComment] = useState(""); // New comment input

  // Fetch comments when expanded
  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded]);

  // Fetch comments from the server
  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/threads/${id}/comments`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
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
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return; // Prevent empty comments

    try {
      const response = await axios.post(
        `http://localhost:8080/threads/${id}/comments`,
        {
          content: newComment,
          userId: currentUser,
        }
      );

      setComments([...comments, response.data]); // Update comments list
      setNewComment(""); // Clear input field
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
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
          <button onClick={handleUpdate}>Save</button>
        </>
      ) : (
        <>
          <h2>{newTitle}</h2>
          <p>{newContent}</p>
          {userId === currentUser && (
            <button onClick={() => setEditMode(true)}>Edit</button>
          )}
        </>
      )}

      {/* Expand/Collapse Comments Section */}
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide Comments" : "Show Comments"}
      </button>

      {expanded && (
        <div className="comments-section">
          <h3>Comments</h3>
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <p>
                  {comment.content} <small>by User {comment.userId}</small>
                </p>
              </li>
            ))}
          </ul>

          {/* Add New Comment */}
          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
            />
            <button onClick={handleAddComment}>Add Comment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
