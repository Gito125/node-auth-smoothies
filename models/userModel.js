const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  email: {
    required: [true, 'Please enter an email'],
    type: String,
    validate: [isEmail, 'Please enter a valid email'],
    unique: true, // You can't create an error message for unique instead, look for information about the error
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minLength: [6, 'Password should be 6 characters and above']
  }
})

// Run func before doc saved to db
userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt()
  this.password = await bcrypt.hash(this.password, salt)
 next()
})

// custome function for logging users in
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({email})
  if (user) {
    const auth = await bcrypt.compare(password, user.password)
    if(auth) {
      return user
    }
    throw Error('Incorrect password')
  }
  throw Error('Email does not exist')
}

const userModel = mongoose.model('user', userSchema)
module.exports = userModel