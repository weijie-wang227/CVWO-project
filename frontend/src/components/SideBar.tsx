import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Drawer,
  Box,
  Typography,
  Toolbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

interface Category {
  id: number;
  name: string;
}

interface SidebarProps {
  text: string;
  onCategorySelect: (selectedCategories: number[]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ text, onCategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

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

  return (
    <>
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}>
          <Toolbar />
          <Typography variant="h6">{text}</Typography>
          <FormGroup>
            {categories.map((category) => (
              <FormControlLabel
                onChange={() => handleCategoryToggle(category.id)}
                control={<Checkbox />}
                label={category.name}
              />
            ))}
          </FormGroup>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
