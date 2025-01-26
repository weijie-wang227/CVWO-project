import { useState, useEffect } from "react";
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
import { useLocation } from "react-router-dom";

interface Category {
  id: number;
  name: string;
}

interface SidebarProps {
  onCategorySelect: (selectedCategories: number[]) => void;
}

const Sidebar = ({ onCategorySelect }: SidebarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const location = useLocation();
  useEffect(() => {
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
          <Typography variant="h6">
            {location.pathname == "/"
              ? "Filter by Categories"
              : "Select Categories"}
          </Typography>
          <FormGroup>
            {categories.map((category) => (
              <FormControlLabel
                onChange={() => handleCategoryToggle(category.id)}
                control={<Checkbox />}
                label={category.name}
                key={category.id}
              />
            ))}
          </FormGroup>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
