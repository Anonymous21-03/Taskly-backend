const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const taskRoutes = require('./routes/taskRoutes')
const cors = require('cors')

dotenv.config()

const app = express()

// Updated CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://anonymous21-03.github.io',
      'https://anonymous21-03.github.io/Taskly-frontend'  // Add this
    ],
    credentials: true
  })
)

app.use(express.json())

connectDB()

app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)

app.get('/', (req, res) => {
  res.send('API Worked!')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`)
})