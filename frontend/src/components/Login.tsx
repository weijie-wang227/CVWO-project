import axios from "axios";
import { useState, Dispatch, SetStateAction } from "react";
import { Button, Typography, AppBar, Toolbar, TextField } from "@mui/material";

const Login = ({
  setUserId,
  userId,
}: {
  setUserId: Dispatch<SetStateAction<number>>;
  userId: number;
}) => {
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/login", {
        username,
      });
      setUserId(response.data.userId);
      localStorage.setItem("userId", response.data.userId.toString()); // Save session in localStorage
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUserId(0); // Clear user ID
    localStorage.removeItem("userId"); // Remove from storage
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
