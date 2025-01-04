import React, { useEffect, useState } from "react";
import axios from "axios";
import Post from "./components/Post";

interface Thread {
  id: number;
}

const App: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Fetch threads
  useEffect(() => {
    axios
      .get("http://localhost:8080/threads")
      .then((response) => setThreads(response.data))
      .catch((error) => console.error("Error fetching threads:", error));
  }, []);

  // Handle adding new thread
  const handleAddThread = () => {
    axios
      .post("http://localhost:8080/threads", {
        title: newTitle,
        content: newContent,
      })
      .then(() => {
        setNewTitle("");
        setNewContent("");
        window.location.reload(); // Refresh threads
      })
      .catch((error) => console.error("Error adding thread:", error));
  };

  return (
    <div>
      <h1>Forum Threads</h1>
      <div>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Thread title"
        />
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Thread content"
        />
        <button onClick={handleAddThread}>Add Thread</button>
      </div>

      {threads.map((thread) => (
        <Post key={thread.id} id={thread.id} />
      ))}
    </div>
  );
};

export default App;
