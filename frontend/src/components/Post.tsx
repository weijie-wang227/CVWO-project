import axios from "axios";
import { useState, useEffect } from "react";

interface PostProps {
  id: number;
  title: string;
  content: string;
  userId: number;
  currentUser: number;
}

const Post = ({ id, title, content, userId, currentUser }: PostProps) => {
  const [newTitle, setTitle] = useState("");
  const [newContent, setContent] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setTitle(title);
    setContent(content);
  }, []);

  const handleUpdate = async () => {
    console.log(userId);
    await axios.put(`http://localhost:8080/threads/${id}`, {
      newTitle,
      newContent,
      userId,
    });
    setEditMode(false);
  };

  return (
    <div>
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
    </div>
  );
};

export default Post;
