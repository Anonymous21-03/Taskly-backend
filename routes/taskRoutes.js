const express = require('express')
const Task = require('../models/tasks')
const router = express.Router()
const protect = require('../middleware/authMiddleware')

// Create task
router.post('/', protect, async (req, res) => {
  try {
    const task = await Task.create({
      user: req.user,
      ...req.body
    })
    res.status(201).json(task)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get all tasks with filters
router.get('/', protect, async (req, res) => {
  try {
    const filter = { user: req.user }
    if (req.query.status) filter.status = req.query.status
    if (req.query.priority) filter.priority = req.query.priority

    const sortBy = req.query.sortBy || 'startTime'
    const order = req.query.order === 'desc' ? -1 : 1

    const tasks = await Task.find(filter).sort({ [sortBy]: order })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      { ...req.body },
      { new: true }
    )
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user
    })
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router