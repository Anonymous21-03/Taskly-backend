const mongoose = require('mongoose')

const taskSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now()
    },
    endTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    priority: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 1
    }
  },
  {
    timestamps: true
  }
)
const Task = mongoose.model('Task', taskSchema)
module.exports = Task
