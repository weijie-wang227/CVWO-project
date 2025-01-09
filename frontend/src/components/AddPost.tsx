import axios from "axios";
import { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material/";

interface Category {
  id: number;
  name: string;
}

interface AddPostProps {
  userId: number;
  onPostAdded: () => void; // Callback to refresh post list
}

const AddPost = ({ userId, onPostAdded }: AddPostProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [filled, setFill] = useState(true);

  // Fetch categories when the component loads
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:8080/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  // Toggle category selection
  const toggleCategory = (id: number) => {
    setSelectedCategories(
      (prevSelected) =>
        prevSelected.includes(id)
          ? prevSelected.filter((catId) => catId !== id) // Remove if already selected
          : [...prevSelected, id] // Add if not selected
    );
  };

  const handleAddPost = async () => {
    if (title === "" || content === "") {
      setFill(false);
      return;
    }
    try {
      await axios.post("http://localhost:8080/threads", {
        title,
        content,
        userId,
        categories: selectedCategories, // Send selected categories
      });
      onPostAdded(); // Refresh the post list after adding
      setTitle("");
      setContent("");
      setSelectedCategories([]); // Clear selected categories
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  return (
    <div>
      <h3>Add New Post</h3>
      <div>
        <TextField
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
      </div>
      <TextField
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
      />
      {!filled && <div>Title and Content field cannot be empty</div>}

      <h4>Select Categories:</h4>
      <div>
        {categories.map((category) => (
          <label key={category.id} style={{ marginRight: "10px" }}>
            <input
              type="checkbox"
              value={category.id}
              checked={selectedCategories.includes(category.id)}
              onChange={() => toggleCategory(category.id)}
            />
            {category.name}
          </label>
        ))}
      </div>

      <Button onClick={handleAddPost}>Add Post</Button>
    </div>
  );
};

export default AddPost;
