import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./components/Post";
import AddPost from "./components/AddPost";
import Login from "./components/Login";
import Sidebar from "./components/SideBar"; //Sidebar component
import { Divider, Box, Toolbar } from "@mui/material"; //MUI
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

interface Thread {
  id: number;
  title: string;
  content: string;
  userId: number;
  categories: number[];
}

const App = () => {
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

  useEffect(() => {
    fetchThreads();
  }, [userId]); // Fetch threads whenever userId changes

  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <Login setUserId={setUserId} userId={userId} />
        <Sidebar onCategorySelect={setSelectedCategories} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            p: 3,
          }}
          maxWidth="calc(100vw - 320px)"
        >
          <Toolbar />

          <Routes>
            <Route
              path="/"
              element={
                <>
                  {threads &&
                    filteredThreads.map((thread) => (
                      <React.Fragment key={thread.id}>
                        <Post
                          id={thread.id}
                          oldTitle={thread.title}
                          oldContent={thread.content}
                          userId={thread.userId}
                          currentUser={userId}
                          onDelete={fetchThreads}
                        />
                        <Divider />
                      </React.Fragment>
                    ))}
                </>
              }
            />
            <Route
              path="/addpost"
              element={
                <AddPost
                  userId={userId}
                  onPostAdded={() => {
                    fetchThreads();
                    window.location.href = "/";
                  }}
                  selectedCategories={selectedCategories}
                />
              }
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

export default App;
