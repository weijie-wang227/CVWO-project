import React, { useState, useEffect } from "react";
import axios from "axios";
import { Drawer, Button, Box } from "@mui/material";

interface Category {
  id: number;
  name: string;
}

interface SidebarProps {
  onCategorySelect: (selectedCategories: number[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    // Fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8080/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryToggle = (id: number) => {
    const updatedSelection = selectedCategories.includes(id)
      ? selectedCategories.filter((categoryId) => categoryId !== id)
      : [...selectedCategories, id];
    setSelectedCategories(updatedSelection);
    onCategorySelect(updatedSelection); // Notify parent component
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <>
      <Button onClick={toggleDrawer(true)}>Choose Categories</Button>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <h3>Categories</h3>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  {category.name}
                </label>
              </li>
            ))}
          </ul>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
