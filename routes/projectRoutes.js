import express from 'express';
import Project from '../models/Project.js'; // Import the Project model
import Task from '../models/Task.js';

const router = express.Router();

// --- Define Our Routes ---

// @route   POST /api/projects
// @desc    Create a new project
router.post('/', async (req, res) => {
  try {
    const { title } = req.body; // Get the title from the request body

    if (!title) {
      return res.status(400).json({ msg: 'Please enter a title' });
    }

    const newProject = new Project({
      title,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject); // Send the new project back as JSON
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/projects
// @desc    Get all projects
router.get('/', async (req, res) => {
  try {
    // Find all projects and sort them by creation date (newest first)
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project AND all its associated tasks
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the project to ensure it exists
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // 2. Delete all tasks associated with this project
    await Task.deleteMany({ project: id });

    // 3. Delete the project itself
    await Project.findByIdAndDelete(id);

    res.json({ msg: 'Project and all associated tasks deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;