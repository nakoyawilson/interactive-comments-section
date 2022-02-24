const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema({
  content: String,
  createdAt: String,
  score: Number,
  replyingTo: String,
  user: {
    image: {
      png: String,
      webp: String,
    },
    username: String,
  },
});

module.exports = mongoose.model("Reply", ReplySchema);
