import mongoose from "mongoose";
// Define the todo schema
const todoSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  text: {
    type: String,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  category: {
    type: String,
  },
});
// Export the Todo model
export const Todo = mongoose.model("Todo", todoSchema);
