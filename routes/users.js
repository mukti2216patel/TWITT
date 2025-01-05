const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost:27017/twitter');

const userSchema = new mongoose.Schema({
  username: String,
  fullname: String,
  password: String,
  profileImage: String,
  email: String,
  contact: Number,
  Age: Number,
  profession: String,
  hobby: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
}],

  lastLogin: [{ type: Date, default: Date.now }],
});

userSchema.plugin(plm);
const User = mongoose.model('User', userSchema);

module.exports = User;
