
const mongoose = require('mongoose');


// mongoose.connect('mongodb://localhost:27017/twitter');

const postSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: String,
  description: String,
  postimage: String,
  likes: Number,
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
