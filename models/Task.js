import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false, // New tasks are not completed by default
    },
    project: {
      type: mongoose.Schema.Types.ObjectId, // This is the "magic" link
      ref: 'Project', // Tells Mongoose this ID refers to a document in the 'Project' collection
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose will create a collection named 'tasks'
export default mongoose.model('Task', taskSchema);