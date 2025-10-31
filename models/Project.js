import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Removes whitespace from the beginning and end
    },
    // We don't need to store tasks here;
    // tasks will reference their parent project.
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Mongoose will create a collection named 'projects' (lowercase, plural)
export default mongoose.model('Project', projectSchema);