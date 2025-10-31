import express from 'express';
import Task from '../models/Task.js'; // Import the Task model
import Project from '../models/Project.js'; // We need this to check if the project exists

const router = express.Router();

// @route   POST /api/tasks
// @desc    Create a new task for a specific project
router.post('/', async (req, res) => {
  try {
    const { text, project } = req.body;

    // Simple validation
    if (!text || !project) {
      return res.status(400).json({ msg: 'Please provide text and a project ID' });
    }

    // Check if the project actually exists
    const existingProject = await Project.findById(project);
    if (!existingProject) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const newTask = new Task({
      text,
      project, // This links the task to the project
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/tasks/:projectId
// @desc    Get all tasks for a specific project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Find all tasks where the 'project' field matches the projectId
    const tasks = await Task.find({ project: projectId }).sort({ createdAt: 'desc' });
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (e.g., mark as complete)
// @route   PUT /api/tasks/:id
// @desc    Update a task (e.g., mark as complete OR edit text)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, isCompleted } = req.body; // Get both possible fields

    // Build an object with only the fields that were provided
    const updateFields = {};
    if (text !== undefined) {
      updateFields.text = text.trim();
    }
    if (isCompleted !== undefined) {
      updateFields.isCompleted = isCompleted;
    }

    // Find the task by its ID and update it with the new fields
    // { new: true } tells Mongoose to return the *updated* document
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields }, // Use $set to update only provided fields
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Send back a success message or the deleted task
    res.json({ msg: 'Task deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;