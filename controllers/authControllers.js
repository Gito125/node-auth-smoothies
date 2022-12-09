const mongoose = require('mongoose')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

// Handle errors
const handleErrors = err => {
  console.log(err.message, err.code)
  let error = {email: '', password: ''}

  // validation
  if (err.message.includes('user validation failed')) {
    // console.log(Object.values(err.errors))
    Object.values(err.errors).forEach(({properties}) => {
      error[properties.path] = properties.message
    })
  }
  
  // Duplicate email error code
  if (err.code === 11000) {
    error.email = 'Email is already registered'
  }

  // Incorrect email
  if (err.message === 'Email does not exist') {
    error.email = 'That email is not registered'
  }

  // Incorrect password
  if (err.message === 'Incorrect password') {
    error.password = 'That password is incorrect'
  }
  
  return error
}

const expireDate = 3 * 24 * 60 * 60 // must be in seconds

// Handle jwt
const createToken = id => {
  return jwt.sign({id}, 'gideon\'s secret', {
    expiresIn: expireDate
  })
}

module.exports.login_get = (req, res) => {
  res.render('login')
}

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.login(email, password)
    const token = createToken(user._id)
    res.cookie('jwt', token, {httpOnly: true, maxAge: expireDate * 1000})
    res.status(200).json({user: user._id})
  }
  catch(err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}

module.exports.signup_get = (req, res) => {
  res.render('signup')
}

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.create({email, password})
    const token = createToken(user._id)
    res.cookie('jwt', token, {httpOnly: true, maxAge: expireDate * 1000})
    res.status(201).json({user: user._id})
  }
  catch (err) {
    const errors = handleErrors(err)
    res.status(400).json({errors})
  }
}

module.exports.logout_post = (req, res) => {
  res.cookie('jwt', '', {maxAge: 1000})
  res.redirect('/')
}