import React, { useEffect, useState } from "react";
import axios from "axios";

interface Comment {
  id: number;
  content: string;
}

interface PostProps {
  id: number; // Pass thread ID as a prop
}

const Post: React.FC<PostProps> = ({ id }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showComments, setShowComments] = useState<boolean>(false);

  // Fetch thread details
  useEffect(() => {
    axios
      .get(`http://localhost:8080/threads/${id}`)
      .then((response) => {
        setTitle(response.data.title);
        setContent(response.data.content);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching thread:", error);
        setLoading(false);
      });
  }, [id]);

  // Toggle comments visibility
  const toggleComments = () => {
    if (!showComments) {
      axios
        .get(`http://localhost:8080/threads/${id}/comments`)
        .then((response) => {
          setComments(response.data);
          setShowComments(true);
        })
        .catch((error) => console.error("Error fetching comments:", error));
    } else {
      setShowComments(false);
    }
  };

  // Handle adding a new comment
  const handleAddComment = () => {
    axios
      .post(`http://localhost:8080/threads/${id}/comments`, {
        content: newComment,
      })
      .then(() => {
        setNewComment("");
        toggleComments(); // Refresh comments
      })
      .catch((error) => console.error("Error adding comment:", error));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}
    >
      <h2>{title}</h2>
      <p>{content}</p>

      <button onClick={toggleComments}>
        {showComments ? "Hide Comments" : "Show Comments"}
      </button>

      {showComments && (
        <div>
          <ul>
            <ul>
              {comments?.map((comment) => (
                <li key={comment.id}>{comment.content}</li>
              ))}
            </ul>
          </ul>
          <div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
            />
            <button onClick={handleAddComment}>Add Comment</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
