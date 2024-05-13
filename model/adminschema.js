const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const AdminSchema = new Schema({
  adminname: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
   
  },
  password: {
    type: String,
    required: true,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const AdminModel = mongoose.model('Admin', AdminSchema);

module.exports = AdminModel;
