// schema. defining types for mongoose

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: String,           
  avatar: String,         
  content: String,       
  imageUrl: String, 
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);