import axios from "axios";
import { useState } from "react";
import { Button } from "@mui/material";

const Login = ({ onLogin }: { onLogin: (id: number) => void }) => {
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:8080/login", {
        username,
      });
      onLogin(response.data.userId);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
};

export default Login;
