import axios from "axios";
import { useState, useEffect } from "react";
import { TextField, Button, Box, Typography } from "@mui/material/";
import { useNavigate } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;

interface AddPostProps {
  userId: number;
  onPostAdded: () => void; // Callback to refresh post list
  selectedCategories: number[];
}

const AddPost = ({ userId, onPostAdded, selectedCategories }: AddPostProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleFilled, setTitleFill] = useState(false);
  const [contentFilled, setContentFill] = useState(false);
  const [lengthError, setError] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (userId == 0) {
      navigate("/");
    }
  }, [userId]);

  const handleAddPost = async () => {
    setContentFill(false);
    setTitleFill(false);
    setError(false);

    if (title == "") {
      setTitleFill(true);
      setContentFill(false);
      return;
    } else if (content == "") {
      setTitleFill(false);
      setContentFill(true);
      return;
    }

    if (title.length > 200) {
      setError(true);
      return;
    }

    try {
      await axios.post(apiUrl + "/threads", {
        title,
        content,
        userId,
        categories: selectedCategories, // Send selected categories
      });
      onPostAdded(); // Refresh the post list after adding
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  return (
    <Box>
      <Typography variant="h3">Add New Post</Typography>
      <Box
        sx={{
          pt: 2,
        }}
      >
        <TextField
          error={titleFilled || lengthError}
          label={
            titleFilled
              ? "Don't leave empty"
              : lengthError
              ? "Title too long"
              : undefined
          }
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          fullWidth
        />
      </Box>
      <Box sx={{ pt: 2 }}>
        <TextField
          error={contentFilled}
          label={contentFilled ? "Don't leave empty" : undefined}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          multiline
          rows={5}
          style={{ flex: 1 }}
          fullWidth
        />
      </Box>

      <Button onClick={handleAddPost}>Add Post</Button>
    </Box>
  );
};

export default AddPost;
