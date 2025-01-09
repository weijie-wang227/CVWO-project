import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./components/Post"; // Post component
import AddPost from "./components/AddPost";
import Login from "./components/Login"; // Login component
import Sidebar from "./components/SideBar"; //Sidebar component

interface Thread {
  id: number;
  title: string;
  content: string;
  userId: number;
  categories: number[];
}

const App: React.FC = () => {
  const [userId, setUserId] = useState<number>(
    () => Number(localStorage.getItem("userId")) || 0
  );
  const [threads, setThreads] = useState<Thread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Fetch threads from backend
  const fetchThreads = async () => {
    try {
      const response = await axios.get("http://localhost:8080/threads");
      setThreads(Array.isArray(response.data) ? response.data : []);
      setFilteredThreads(threads); // Initially show all threads
    } catch (error) {
      console.error("Failed to fetch threads:", error);
    }
  };

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredThreads(threads); // Show all threads if no category selected
    } else {
      setFilteredThreads(
        threads.filter((thread) =>
          thread.categories.some((categoryId) =>
            selectedCategories.includes(categoryId)
          )
        )
      );
    }
  }, [selectedCategories, threads]);

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
      <Sidebar onCategorySelect={setSelectedCategories} />
      <div>
        {userId > 0 && <AddPost userId={userId} onPostAdded={fetchThreads} />}
        {threads &&
          filteredThreads.map((thread) => (
            <Post
              key={thread.id}
              id={thread.id}
              oldTitle={thread.title}
              oldContent={thread.content}
              userId={thread.userId}
              currentUser={userId}
              onDelete={fetchThreads}
            />
          ))}
      </div>
    </div>
  );
};

export default App;
