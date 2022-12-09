const morgan = require('morgan')
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const { requireAuth, checkUser } = require('./middleware/authMiddleware')

// Middleware
app.set('view engine', 'ejs')
app.use(morgan('dev'))
app.use(express.static('./public'))
app.use(express.json())
app.use(cookieParser())

// Connecting to db
const dbURI = 'mongodb+srv://devGito125:devGito125@users.n9t5vtu.mongodb.net/?retryWrites=true&w=majority'
const dbURI_Off = 'mongodb://localhost:27017/node-auth'
mongoose.connect(dbURI)
  .then(() => app.listen(process.env.PORT || 4040, () => console.log('Connected and Listening')))
  .catch(err => {
    console.log(`Error is ${err}`)
    mongoose.connect(dbURI_Off).then(() => app.listen(process.env.PORT || 4040, () => console.log('Connected and Listening***')))
  })

// Routes
app.get('*', checkUser) // apply this middleware to every single get request

app.get('/', (req, res) => {
  res.render('home')
})

app.get('/smoothies', requireAuth, (req, res) => {
  res.render('smoothies')
})

app.use('/', authRoutes)

module.exports = app