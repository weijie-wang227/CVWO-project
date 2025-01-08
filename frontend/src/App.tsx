import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./components/Post"; // Post component
import AddPost from "./components/AddPost";
import Login from "./components/Login"; // Login component

interface Thread {
  id: number;
  title: string;
  content: string;
  userId: number;
}

const App: React.FC = () => {
  const [userId, setUserId] = useState<number>(
    () => Number(localStorage.getItem("userId")) || 0
  );
  const [threads, setThreads] = useState<Thread[]>([]);

  // Fetch threads from backend
  const fetchThreads = async () => {
    try {
      const response = await axios.get("http://localhost:8080/threads");
      setThreads(response.data);
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    }
  };

  // Handle user login
  const handleLogin = (id: number) => {
    setUserId(id); // Set user ID
    localStorage.setItem("userId", id.toString()); // Save session in localStorage
    fetchThreads(); // Fetch threads after login
  };

  // Handle logout
  const handleLogout = () => {
    setUserId(0); // Clear user ID
    localStorage.removeItem("userId"); // Remove from storage
  };

  useEffect(() => {
    fetchThreads();
  }, [userId]); // Fetch threads whenever userId changes

  return (
    <div>
      <div>
        {userId ? (
          <div>
            <h1>Welcome, User {userId}</h1>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
      <div>
        <AddPost userId={userId} onPostAdded={fetchThreads} />
        {threads.map((thread) => (
          <Post
            key={thread.id}
            id={thread.id}
            title={thread.title}
            content={thread.content}
            userId={thread.userId}
            currentUser={userId}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
