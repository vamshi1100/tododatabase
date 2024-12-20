import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Todo } from "./backend/js/model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "frontend")));

mongoose
  .connect("mongodb://localhost:27017/todo")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.post("/add", async (req, res) => {
  try {
    const { id, inputd, startDated, endDated, category, checked } = req.body;
    const todo = new Todo({
      id,
      text: inputd,
      startDate: new Date(startDated),
      endDate: new Date(endDated),
      category,
      checked,
    });
    await todo.save();
    res.status(200).json({ data: req.body });
  } catch (error) {
    console.error("Error saving todo:", error);
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  }
});

app.get("/getdata", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json({ data: todos });
  } catch (error) {
    console.error("Error retrieving data:", error);
    res
      .status(500)
      .json({ message: "Error retrieving data", error: error.message });
  }
});
app.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;

  console.log(`Updating todo with ID: ${id}, checked: ${checked}`);

  try {
    const todo = await Todo.findByIdAndUpdate(id, { checked }, { new: true });

    if (!todo) {
      console.log(`Todo with ID ${id} not found`);
      return res.status(404).json({ message: "Todo not found" });
    }

    res.status(200).json({ message: "Todo updated successfully", todo });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Error updating todo", error });
  }
});

app.delete("/delete/:id", async (req, res) => {
  const todoId = req.params.id;

  try {
    const result = await Todo.deleteOne({ _id: todoId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Todo item not found" });
    }

    res.json({ message: "Todo item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting todo item" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
