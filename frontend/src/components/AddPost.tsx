import axios from "axios";
import { useState } from "react";

interface AddPostProps {
  userId: number;
  onPostAdded: () => void; // Callback to refresh post list
}

const AddPost = ({ userId, onPostAdded }: AddPostProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleAddPost = async () => {
    try {
      await axios.post("http://localhost:8080/threads", {
        title,
        content,
        userId,
      });
      onPostAdded(); // Refresh the post list after adding
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  return (
    <div>
      <h3>Add New Post</h3>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
      <button onClick={handleAddPost}>Add Post</button>
    </div>
  );
};

export default AddPost;
