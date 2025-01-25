import axios from "axios";
import { useState, Dispatch, SetStateAction } from "react";
import { Button, Typography, AppBar, Toolbar, TextField } from "@mui/material";
import { useLocation } from "react-router-dom";

interface LoginProps {
  setUserId: Dispatch<SetStateAction<number>>;
  userId: number;
}

const Login = ({ setUserId, userId }: LoginProps) => {
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem("username") || "" // Initialize with localStorage
  );

  const location = useLocation();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/login", {
        username,
      });
      setUserId(response.data.userId);
      localStorage.setItem("userId", response.data.userId.toString()); // Save session in localStorage
      localStorage.setItem("username", username);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUserId(0); // Clear user ID
    setUsername(""); // Clear username state
    localStorage.removeItem("userId"); // Remove userId from storage
    localStorage.removeItem("username"); // Remove username from storag
  };

  const handleClick = () => {
    if (location.pathname == "/") {
      window.location.href = "/addpost";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "white" }}>
      <Toolbar>
        {userId ? (
          <>
            <Typography variant="h5" sx={{ color: "darkblue" }}>
              Welcome, {username}
            </Typography>
            <Button onClick={handleLogout}>Logout</Button>
            <Button variant="contained" onClick={handleClick}>
              {location.pathname == "/addpost" ? "Return" : "+ Add Post"}
            </Button>
          </>
        ) : (
          <>
            <TextField
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button onClick={handleLogin}>Login</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Login;
