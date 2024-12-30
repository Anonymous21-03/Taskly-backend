const express = require('express')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const router = express.Router()
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const protect = require("../middleware/authMiddleware")
const Task = require('../models/tasks')

dotenv.config()

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPwd
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Server Error', error: e.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      })
      res.status(200).json({
        token,
        _id: user.id,
        name: user.name,
        email: user.email
      })
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
})

router.get("/dashboard", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalTasks = await Task.countDocuments({ user: req.user });
    const completedTasks = await Task.countDocuments({ user: req.user, status: 'completed' });
    const pendingTasks = await Task.countDocuments({ user: req.user, status: 'pending' });
    
    const completedPercentage = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    const pendingPercentage = totalTasks > 0 ? ((pendingTasks / totalTasks) * 100).toFixed(1) : 0;

    const currentTime = new Date();
    const pendingTasksData = await Task.find({ user: req.user, status: 'pending' });
    const completedTasksData = await Task.find({ user: req.user, status: 'completed' });

    const averageCompletionTime = completedTasksData.length > 0 
      ? completedTasksData.reduce((acc, task) => {
          const startTime = new Date(task.startTime);
          const endTime = new Date(task.endTime);
          return acc + (endTime - startTime) / (1000 * 60 * 60);
        }, 0) / completedTasksData.length
      : 0;

    const timeStats = [1, 2, 3, 4, 5].map(priority => {
      const tasksWithPriority = pendingTasksData.filter(task => task.priority === priority);
      
      const timeCalc = tasksWithPriority.reduce((acc, task) => {
        const startTime = new Date(task.startTime);
        const endTime = new Date(task.endTime);
        
        const timeLapsed = Math.max(0, (currentTime - startTime) / (1000 * 60 * 60));
        const balanceTime = Math.max(0, (endTime - currentTime) / (1000 * 60 * 60));
        
        return {
          timeLapsed: acc.timeLapsed + (currentTime > startTime ? timeLapsed : 0),
          balanceTime: acc.balanceTime + balanceTime
        };
      }, { timeLapsed: 0, balanceTime: 0 });

      return {
        priority,
        count: tasksWithPriority.length,
        timeLapsed: Math.round(timeCalc.timeLapsed * 10) / 10,
        balanceTime: Math.round(timeCalc.balanceTime * 10) / 10
      };
    });

    res.status(200).json({
      name: user.name,
      email: user.email,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completedPercentage,
        pendingPercentage,
        timeStats,
        averageCompletionTime: Math.round(averageCompletionTime * 10) / 10
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router
