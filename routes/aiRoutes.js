import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Task from '../models/Task.js'; // We'll save the AI's response as new tasks
import Project from '../models/Project.js'; // To check if the project exists

const router = express.Router();
// Initialize the Google AI client
// Make sure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// @route   POST /api/ai/breakdown
// @desc    Break down a large task into sub-tasks using AI
router.post('/breakdown', async (req, res) => {
  try {
    const { text, projectId } = req.body;
    console.log('✅ AI /breakdown route hit.');

    // 1. Validation
    if (!text || !projectId) {
      return res
        .status(400)
        .json({ msg: 'Please provide text and a project ID' });
    }

    // 2. Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // 3. Craft the AI Prompt
    // This is the "magic" - prompt engineering!
    const prompt = `
      Break down the following complex task into a list of 5-10 simple, actionable sub-tasks.
      Respond *only* with the sub-tasks, one per line. Do not add any other text, explanations, or formatting (like bullet points or numbers).

      Example Input: "Build a new portfolio website"
      Example Output:
      Design the homepage layout
      Create a wireframe for the projects page
      Set up the React frontend project
      Build the navigation bar component
      Create the 'About Me' section
      Set up a backend to handle a contact form

      Task to break down: "${text}"
    `;

    // 4. Call the AI Model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponseText = await response.text();
    console.log('🤖 AI Response Text:', aiResponseText);

    // 5. Process the AI Response
    // The AI should return a string like "Task 1\nTask 2\nTask 3"
    // We split it by newlines to get an array of task strings
    const taskStrings = aiResponseText
      .split('\n')
      .filter((task) => task.trim().length > 0); // Remove any empty lines
      console.log('📦 Processed Tasks:', taskStrings);

    if (taskStrings.length === 0) {
      return res
        .status(500)
        .json({ msg: 'AI could not generate tasks. Try rephrasing.' });
    }

    // 6. Save the new tasks to the database
    // Create an array of task objects to be saved
    const newTasks = taskStrings.map((taskText) => ({
      text: taskText,
      project: projectId, // Link each new task to the project
    }));

    // Insert all new tasks into the database at once
    const savedTasks = await Task.insertMany(newTasks);

    // 7. Send the new tasks back to the client
    res.status(201).json(savedTasks);
  } catch (err) {
    console.error('AI route error:', err);
    res.status(500).send('Server Error');
  }
});

export default router;