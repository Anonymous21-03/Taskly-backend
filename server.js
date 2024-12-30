const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const taskRoutes = require('./routes/taskRoutes')
const cors = require('cors')
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://anonymous21-03.github.io/Taskly-frontend/']
  })
)

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

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
